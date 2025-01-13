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

// Select the appropriate environment file
const envPath = envFileMap[process.env.NODE_ENV || 'default'] || envFileMap.default;

const resolvedEnvPath = path.resolve(
  __dirname,
  `../../${envPath}`
);

// Load environment variables from the correct file
const result = dotenv.config({ path: `${resolvedEnvPath}` }).parsed;
let envConfig;
console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV == "development") {
  console.log('IN DEV');
  const { username, host, dbname, password, port } = JSON.parse(process.env.DB_SECRET);
  const DB_URL = `postgresql://${username}:${password}@${host}:${port}/${dbname}`;
  result.DATABASE_URL = DB_URL;
  envConfig = parseEnv(result, {
    API_PORT: z.string().min(1, "API_PORT is required"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    ENCRYPTION_KEY: z.string().min(1, "ENCRYPTION_KEY is required"),
    CRON_SCHEDUER_PATTERN: z.string().min(1, "CRON_SCHEDUER_PATTERN is required"),
  });
  envConfig.DATABASE_URL = DB_URL;
} else {
  console.log('IN ELSE')
  // Validate the environment variables using zod and znv
  // @ts-ignore
  envConfig = parseEnv(result, {
    API_PORT: z.string().min(1, "API_PORT is required"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
    ENCRYPTION_KEY: z.string().min(1, "ENCRYPTION_KEY is required"),
    CRON_SCHEDUER_PATTERN: z.string().min(1, "CRON_SCHEDUER_PATTERN is required"),
  });
}

export default envConfig;
