import cron from "node-cron";
import envConfig from "../../config";
import { getClient } from "../../../prisma";
import { Status } from "../../../prisma/src/generated/client";

const prisma = getClient();

const checkAndUpdateLeadStatus = async () => {
  console.log("Starting automated status update job...");

  try {
    const now = new Date();

    // Bulk update leads with status "NEW" and created more than 12 hours ago
    const updatedNewLeads = await prisma.lead.updateMany({
      where: {
        status: Status.NEW,
        createdAt: {
          lt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
        },
      },
      data: {
        status: Status.REQUIRES_FOLLOWUP,
        lastAction: "No activity in 12 hours",
        lastActionAt: now,
      },
    });
    console.log(
      `${updatedNewLeads.count} leads updated to REQUIRES_FOLLOWUP.`
    );

    // Bulk update leads with status "IN_PROGRESS" and no activity in 3 days
    const updatedInProgressLeads = await prisma.lead.updateMany({
      where: {
        status: Status.IN_PROGRESS,
        lastActionAt: {
          lt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
      },
      data: {
        status: Status.STALE,
        lastAction: "No activity in 3 days",
        lastActionAt: now,
      },
    });
    console.log(`${updatedInProgressLeads.count} leads updated to STALE.`);
  } catch (error) {
    console.log(`Error during automated status update: ${error.message}`);
  }
};

// Schedule the job to run every hour
export const startScheduler = () => {
  cron.schedule(envConfig.CRON_SCHEDUER_PATTERN, checkAndUpdateLeadStatus);
  console.log("Scheduler started: Running every hour.");
};
