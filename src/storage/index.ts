// Storage abstraction.
// Production: Vercel Blob (driver: "vercel-blob").
// Local development / tests: S3-compatible (driver: "s3"), e.g. RustFS.

import { S3Storage } from "./s3"
import type { StorageDriver } from "./types"
import { VercelBlobStorage } from "./vercel-blob"

export type { StorageDriver, StorageObject } from "./types"

let cached: StorageDriver | null = null

function buildStorage(): StorageDriver {
  const provider = process.env.STORAGE_PROVIDER ?? "s3"
  if (provider === "vercel-blob") {
    return new VercelBlobStorage()
  }
  return new S3Storage({
    endpoint: process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000",
    region: process.env.S3_REGION ?? "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "rustfsadmin",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "rustfsadmin",
    bucket: process.env.S3_BUCKET ?? "signage-contents",
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
    forcePathStyle: true,
  })
}

export function getStorage(): StorageDriver {
  if (!cached) {
    cached = buildStorage()
  }
  return cached
}
