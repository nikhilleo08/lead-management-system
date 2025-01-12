import { parseEnv } from "znv";
import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";

// Determine the environment
const envFileMap: Record<string, string> = {
  production: '.env.production',
  staging: '.env.staging',
  development: '.env.development',
  test: '.env.test',
  default: '.env',
};
console.log(process.env.NODE_ENV)
// Select the appropriate environment file
const envPath = envFileMap[process.env.NODE_ENV || 'default'] || envFileMap.default;

const resolvedEnvPath = path.resolve(
  __dirname,
  `../../${envPath}`
);
console.log(resolvedEnvPath);
// Load environment variables from the correct file
const result = dotenv.config({ path: `${resolvedEnvPath}` }).parsed;

console.log(`Loaded environment file: ${envPath}`, );

// Validate the environment variables using zod and znv
// @ts-ignore
export const envConfig = parseEnv(result, {
  API_PORT: z.string().min(1, "API_PORT is required"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  ENCRYPTION_KEY: z.string().min(1, "ENCRYPTION_KEY is required"),
  CRON_SCHEDUER_PATTERN: z.string().min(1, "CRON_SCHEDUER_PATTERN is required"),
});

export default envConfig;
