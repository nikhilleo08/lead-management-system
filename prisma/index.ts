import envConfig from "../src/config";
import { PrismaClient } from "./src/generated/client";

let client: PrismaClient;

export const getClient = (dbURL?: string) => {
  if (!client) {
    client = new PrismaClient({
      datasourceUrl: dbURL ? dbURL : envConfig.DATABASE_URL
    });
  }
  return client;
};

export async function connectToDB() {
  let client = getClient();

  await client
    .$connect()
    .then((res) => console.log("connected to db sucessfully"))
    .catch((err) => {
      console.log("Error in connecting to DB");
      throw new Error(`DB connection failed: ${err.message}`);
    });
}

export type Client = PrismaClient;
