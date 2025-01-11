import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import envConfig from "../config";
const prisma = new PrismaClient();

const checkAndUpdateLeadStatus = async () => {
  console.log("Starting automated status update job...");

  try {
    const leads = await prisma.lead.findMany();

    const now = new Date();
    for (const lead of leads) {
      if (
        lead.status === "NEW" &&
        lead.createdAt < new Date(now.getTime() - 12 * 60 * 60 * 1000)
      ) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            status: "REQUIRES_FOLLOWUP",
            lastAction: "No activity in 12 hours",
          },
        });
        console.log(`Lead ${lead.id} updated to REQUIRES_FOLLOWUP.`);
      }

      if (
        lead.status === "IN_PROGRESS" &&
        lead.lastActionAt &&
        lead.lastActionAt < new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
      ) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "STALE", lastAction: "No activity in 3 days" },
        });
        console.log(`Lead ${lead.id} updated to STALE.`);
      }
    }
  } catch (error) {
    console.log(`Error during automated status update: ${error.message}`);
  }
};

// Schedule the job to run every hour
export const startScheduler = () => {
  cron.schedule(envConfig.CRON_SCHEDUER_PATTERN, checkAndUpdateLeadStatus);
  console.log("Scheduler started: Running every hour.");
};
