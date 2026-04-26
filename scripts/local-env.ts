// Generate .env for local development.
// Mirrors the docker-compose.yml service definitions.

import { file } from "bun"

const ENV_PATH = ".env"

const MANAGED_KEYS = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "STORAGE_PROVIDER",
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
  "S3_BUCKET",
  "S3_PUBLIC_BASE_URL",
] as const

const localValues: Record<(typeof MANAGED_KEYS)[number], string> = {
  DATABASE_URL: "postgres://raspi:raspi@127.0.0.1:54322/raspi_signage",
  BETTER_AUTH_SECRET: "raspi-signage-development-secret-change-me",
  BETTER_AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  STORAGE_PROVIDER: "s3",
  S3_ENDPOINT: "http://127.0.0.1:9000",
  S3_REGION: "us-east-1",
  S3_ACCESS_KEY_ID: "rustfsadmin",
  S3_SECRET_ACCESS_KEY: "rustfsadmin",
  S3_BUCKET: "signage-contents",
  S3_PUBLIC_BASE_URL: "http://127.0.0.1:9000/signage-contents",
}

const managed = new Set<string>(MANAGED_KEYS)
let existing = ""
if (await file(ENV_PATH).exists()) {
  existing = await file(ENV_PATH).text()
}

const preserved = existing.split("\n").filter((line) => {
  const key = line.split("=")[0]?.trim()
  return key && !managed.has(key)
})

const managedLines = MANAGED_KEYS.map((key) => `${key}=${localValues[key]}`)
const merged = `${[...preserved, ...managedLines].join("\n")}\n`

await Bun.write(ENV_PATH, merged)
console.log("✅ .env updated with local development values")
