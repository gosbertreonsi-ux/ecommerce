import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string(),
});

export const env = envSchema.parse(process.env);