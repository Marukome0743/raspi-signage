// One-shot setup for local development:
// 1. Apply schema (idempotent, drops nothing)
// 2. Ensure RustFS bucket exists with public-read policy
// 3. Seed users via Better Auth + signage data
//
// Equivalent to the previous `supabase db reset` flow.

import { S3Storage } from "../src/storage/s3"

async function ensureBucket() {
  const provider = process.env.STORAGE_PROVIDER ?? "s3"
  if (provider !== "s3") {
    console.log("ℹ️  STORAGE_PROVIDER is not 's3'; skipping local bucket setup")
    return
  }
  const storage = new S3Storage({
    endpoint: process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000",
    region: process.env.S3_REGION ?? "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "rustfsadmin",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "rustfsadmin",
    bucket: process.env.S3_BUCKET ?? "signage-contents",
    forcePathStyle: true,
  })
  await storage.ensurePublicBucket()
  console.log(
    `🪣 bucket "${process.env.S3_BUCKET ?? "signage-contents"}" ready`,
  )
}

async function run(file: string) {
  const proc = Bun.spawn(["bun", file], {
    stdout: "inherit",
    stderr: "inherit",
    env: process.env,
  })
  const code = await proc.exited
  if (code !== 0) {
    throw new Error(`${file} exited with code ${code}`)
  }
}

try {
  await run("scripts/db-migrate.ts")
  await ensureBucket()
  await run("scripts/db-seed.ts")
  console.log("✅ bootstrap complete")
} catch (e) {
  console.error("❌ bootstrap failed:", e)
  process.exit(1)
}
