import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().int().min(1).max(65535),
  HOST: z.string().min(1),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(z.treeifyError(parsedEnv.error));
  process.exit(1);
}
export const env = parsedEnv.data;
