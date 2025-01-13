import {
  GetSecretValueCommand,
  GetSecretValueCommandOutput,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { SQSRecord } from "aws-lambda";
import { parseEnv, z } from "znv";
import { getClient } from "../../../../prisma";
import { Status } from "../../../../prisma/src/generated/client";

export const handler = async (event: SQSRecord[]): Promise<any> => {
  console.log("@@RECEIVED", event, typeof event);

  try {
    const env = parseEnv(process.env, {
      SECRET_MANAGER_ARN: z.string(),
    });

    // Handeling the Secrets from Secrets Manager.
    const secretsManagerClient = new SecretsManagerClient({
      region: "ap-south-1",
    });

    const input = {
      SecretId: env.SECRET_MANAGER_ARN,
    };

    const command = new GetSecretValueCommand(input);

    const response: GetSecretValueCommandOutput =
      await secretsManagerClient.send(command);

    let LEAD_MANAGEMENT_APP_POSTGRES_URL;

    if (response.SecretString) {
      console.log(JSON.parse(response.SecretString));
      LEAD_MANAGEMENT_APP_POSTGRES_URL = JSON.parse(
        response.SecretString
      ).LEAD_MANAGEMENT_APP_POSTGRES_URL;
      if (!LEAD_MANAGEMENT_APP_POSTGRES_URL) {
        throw new Error("Database URL not found");
      }
    }

    // Connect to the database
    const prismaClient = getClient(LEAD_MANAGEMENT_APP_POSTGRES_URL);

    const res = await prismaClient.$queryRawUnsafe("SELECT NOW()");
    console.log("Time in DB", res);

    const now = new Date();

    // Bulk update leads with status "NEW" and created more than 12 hours ago
    const updatedNewLeads = await prismaClient.lead.updateMany({
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
    console.log(`${updatedNewLeads.count} leads updated to REQUIRES_FOLLOWUP.`);

    // Bulk update leads with status "IN_PROGRESS" and no activity in 3 days
    const updatedInProgressLeads = await prismaClient.lead.updateMany({
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
  } catch (error: any) {
    console.error("Error connecting to the database: ", error);
  }
};
