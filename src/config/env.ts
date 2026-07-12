import { z } from "zod";
import * as dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  COOKIE_NAME: z.string().default("transitops_token"),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().default(5),
  LOGIN_LOCK_MINUTES: z.coerce.number().default(20),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
