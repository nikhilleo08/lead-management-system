import { PrismaClient, Status } from "@prisma/client";
const prisma = new PrismaClient();

export class LeadService {
  /**
   * Create a new lead and its initial history record.
   */
  async createLead(name, userId) {
    try {
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
              currentStatus: Status.NEW,
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
   * Get all leads with their latest history entry.
   */
  async getLeads() {
    try {
      return await prisma.lead.findMany();
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
              currentStatus: data.status || existingLead.status,
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

  /**
   * Mark a lead as stale and log the action.
   */
  async markLeadAsStale(id, reason, userId) {
    try {
      if (!id || !reason || !userId)
        throw new Error("Lead ID, reason, and userId are required");

      return await this.updateLead(
        id,
        {
          status: Status.STALE,
          reason,
          lastAction: "Marked as stale",
        },
      );
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
        throw new Error("Lead ID, nextFollowUp, reason, and userId are required");

      return await this.updateLead(
        id,
        {
          nextFollowUp,
          reason,
          lastAction: "Follow-up scheduled",
        },
      );
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
