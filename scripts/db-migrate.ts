import { file } from "bun"
import { Pool } from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const sql = await file(
  new URL("../src/db/schema.sql", import.meta.url).pathname,
).text()

const pool = new Pool({ connectionString })
try {
  await pool.query(sql)
  console.log("✅ schema applied")
} finally {
  await pool.end()
}
