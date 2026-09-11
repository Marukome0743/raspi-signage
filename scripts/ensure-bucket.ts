// Ensures the local RustFS bucket exists with a public-read policy. This is the
// one step of `mise run db:reset` that needs an S3 API call rather than a shell
// command; the schema and the seed are plain scripts the task runs directly.

import { S3Storage } from "../src/storage/s3"

const provider = process.env.STORAGE_PROVIDER ?? "s3"
if (provider !== "s3") {
  console.log("ℹ️  STORAGE_PROVIDER is not 's3'; skipping local bucket setup")
  process.exit(0)
}

const bucket = process.env.S3_BUCKET ?? "signage-contents"
const storage = new S3Storage({
  endpoint: process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000",
  region: process.env.S3_REGION ?? "us-east-1",
  accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "rustfsadmin",
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "rustfsadmin",
  bucket,
  forcePathStyle: true,
})

await storage.ensurePublicBucket()
console.log(`🪣 bucket "${bucket}" ready`)
