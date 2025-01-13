import { Role, Status } from "@prisma/client";
import { getClient } from '../'

const prisma = getClient();

async function main() {
  console.log("Start seeding...");

  // Create Users
  const users = await prisma.user.createMany({
    data: [
      { id: "user1-id", name: "Alice Admin", email: "alice@admin.com", role: Role.ADMIN },
      { id: "user2-id", name: "Bob Staff", email: "bob@staff.com", role: Role.STAFF },
      { id: "user3-id", name: "Charlie Staff", email: "charlie@staff.com", role: Role.STAFF },
    ],
    skipDuplicates: true,
  });

  console.log("Users seeded:", users);

  // Create Leads
  const leads = await Promise.all(
    [
      { name: "John Doe", status: Status.NEW },
      { name: "Jane Smith", status: Status.IN_PROGRESS },
      { name: "Acme Corp", status: Status.REQUIRES_FOLLOWUP },
    ].map((lead, index) =>
      prisma.lead.create({
        data: {
          ...lead,
          lastAction: "Created",
          lastActionAt: new Date(),
          histories: {
            create: {
              previousStatus: Status.NEW,
              actionDescription: "Initial creation",
              performedAt: new Date(),
              updatedById: "user2-id", // Assume "Bob Staff" created these leads
            },
          },
        },
      })
    )
  );

  console.log("Leads seeded:", leads.length);

  // Add additional lead history entries
  const leadHistories = await Promise.all(
    leads.map((lead, index) =>
      prisma.leadHistory.create({
        data: {
          leadId: lead.id,
          previousStatus: lead.status,
          actionDescription: "Marked as stale",
          performedAt: new Date(),
          reason: "No response for a month",
          updatedById: "user3-id", // Assume "Charlie Staff" marked them stale
        },
      })
    )
  );

  console.log("Lead histories added:", leadHistories.length);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
