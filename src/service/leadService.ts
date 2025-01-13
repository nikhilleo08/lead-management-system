import { getClient } from "../../prisma";
import { Status } from "../../prisma/src/generated/client";
const prisma = getClient();

export class LeadService {
  /**
   * Create a new lead and its initial history record.
   */
  async createLead(name, userId) {
    try {
      console.log(userId)
      const user = await prisma.user.findFirst({
        where: {
          id: userId
        }
      });
      console.log(user);
      if (!name || !userId) throw new Error("Name and userId are required");

      return await prisma.lead.create({
        data: {
          name,
          status: Status.NEW,
          reason: "Lead created",
          lastAction: "Created",
          lastActionAt: new Date(),
          histories: {
            create: {
              previousStatus: Status.NEW,
              actionDescription: "Initial lead creation",
              performedAt: new Date(),
              updatedById: userId,
            },
          },
        },
        include: {
          histories: true,
        },
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      throw new Error("Failed to create lead");
    }
  }

  /**
   * Get active leads (active in the last month) with pagination.
   */
  async getLeads(page = 1, limit = 10) {
    try {
      // Calculate the date one month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Fetch active leads with pagination
      const leads = await prisma.lead.findMany({
        where: {
          lastActionAt: {
            gte: oneMonthAgo, // Leads active within the last month
          },
          status: {
            not: Status.STALE, // Exclude stale leads
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          lastActionAt: "desc", // Sort by the latest activity
        },
      });

      // Fetch total count for pagination metadata
      const totalCount = await prisma.lead.count({
        where: {
          lastActionAt: {
            gte: oneMonthAgo,
          },
          status: {
            not: Status.STALE,
          },
        },
      });

      // Return leads with pagination metadata
      return {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        leads,
      };
    } catch (error) {
      console.error("Error fetching leads:", error);
      throw new Error("Failed to fetch leads");
    }
  }

  /**
   * Get a specific lead by ID with its complete history.
   */
  async getLeadById(id) {
    try {
      if (!id) throw new Error("Lead ID is required");

      const lead = await prisma.lead.findUnique({
        where: { id },
        include: {
          histories: {
            orderBy: { performedAt: "desc" },
            include: {
              updatedBy: true, // Include details of the user who performed the action
            },
          },
        },
      });

      if (!lead) throw new Error("Lead not found");

      return lead;
    } catch (error) {
      console.error("Error fetching lead by ID:", error);
      throw new Error("Failed to fetch lead by ID");
    }
  }

  /**
   * Update a lead, log the change in history, and handle status updates.
   */
  async updateLead(id, data) {
    try {
      if (!id) throw new Error("Lead ID and userId are required");

      const existingLead = await prisma.lead.findUnique({ where: { id } });
      if (!existingLead) throw new Error("Lead not found");

      return await prisma.lead.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
          lastAction: data.lastAction || "Updated",
          lastActionAt: new Date(),
          histories: {
            create: {
              previousStatus: existingLead.status,
              actionDescription: data.lastAction || "Update performed",
              performedAt: new Date(),
              reason: data.reason,
              updatedById: id,
            },
          },
        },
        include: {
          histories: true,
        },
      });
    } catch (error) {
      console.error("Error updating lead:", error);
      throw new Error("Failed to update lead");
    }
  }
  // id, dateTime, state to track conversion metric which will let us understand where are we stuck from our side, we can answe question like are we taking 12 hours to complete, how many leads are going stale.
  /**
   * Mark a lead as stale and log the action.
   */
  async markLeadAsStale(id, reason, userId) {
    try {
      if (!id || !reason || !userId)
        throw new Error("Lead ID, reason, and userId are required");

      return await this.updateLead(id, {
        status: Status.STALE,
        reason,
        lastAction: "Marked as stale",
      });
    } catch (error) {
      console.error("Error marking lead as stale:", error);
      throw new Error("Failed to mark lead as stale");
    }
  }

  /**
   * Add a follow-up action to a lead and log it.
   */
  async addFollowUp(id, nextFollowUp, reason, userId) {
    try {
      if (!id || !nextFollowUp || !reason || !userId)
        throw new Error(
          "Lead ID, nextFollowUp, reason, and userId are required"
        );

      return await this.updateLead(id, {
        nextFollowUp,
        reason,
        lastAction: "Follow-up scheduled",
      });
    } catch (error) {
      console.error("Error adding follow-up:", error);
      throw new Error("Failed to add follow-up");
    }
  }

  /**
   * Fetch all history records for a specific lead.
   */
  async getLeadHistory(id) {
    try {
      if (!id) throw new Error("Lead ID is required");

      return await prisma.leadHistory.findMany({
        where: { leadId: id },
        orderBy: { performedAt: "desc" },
        include: {
          updatedBy: true,
        },
      });
    } catch (error) {
      console.error("Error fetching lead history:", error);
      throw new Error("Failed to fetch lead history");
    }
  }

  /**
   * Get leads assigned or modified by a specific user.
   */
  async getLeadsByUser(userId) {
    try {
      if (!userId) throw new Error("User ID is required");

      return await prisma.lead.findMany({
        where: {
          histories: {
            some: {
              updatedById: userId,
            },
          },
        },
        include: {
          histories: true,
        },
      });
    } catch (error) {
      console.error("Error fetching leads by user:", error);
      throw new Error("Failed to fetch leads by user");
    }
  }
}
