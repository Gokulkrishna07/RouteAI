import "dotenv/config";
import { Pool } from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || "postgres"}:${process.env.POSTGRES_PASSWORD || "postgres"}@${process.env.POSTGRES_HOST || "localhost"}:${process.env.POSTGRES_PORT || "5432"}/${process.env.POSTGRES_DB || "ai_model_router"}`;

const pool = new Pool({ connectionString });

async function runMigration(fileName: string) {
  const filePath = path.join(
    process.cwd(),
    "src",
    "db",
    "migrations",
    fileName,
  );
  const sql = await readFile(filePath, "utf8");
  console.log(`Running migration: ${fileName}`);
  await pool.query(sql);
  console.log(`Migration complete: ${fileName}`);
}

async function main() {
  try {
    const migrations = [
      "001-create-users-table.sql",
      "002-add-refresh-token-columns.sql",
      "003-create-chat-usage-table.sql",
      "004-create-sessions-and-messages.sql",
      "005-create-api-keys-table.sql",
      "006-add-api-key-id-to-chat-usage.sql",
    ];
    for (const migration of migrations) {
      await runMigration(migration);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
