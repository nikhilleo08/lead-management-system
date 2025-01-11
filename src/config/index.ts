import { parseEnv } from "znv";
import { z } from "zod";

export const envConfig = parseEnv(process.env, {
  API_PORT: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1),
  CRON_SCHEDUER_PATTERN: z.string().min(1),
});


export default envConfig;
