import { betterAuth } from "better-auth"
import { Pool } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var __raspiSignageAuth: ReturnType<typeof buildAuth> | undefined
}

function buildAuth() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  return betterAuth({
    database: new Pool({ connectionString }),
    secret:
      process.env.BETTER_AUTH_SECRET ??
      "raspi-signage-development-secret-change-me",
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 6,
    },
    advanced: {
      cookiePrefix: "raspi-signage",
    },
  })
}

export function getAuth(): ReturnType<typeof buildAuth> {
  if (!globalThis.__raspiSignageAuth) {
    globalThis.__raspiSignageAuth = buildAuth()
  }
  return globalThis.__raspiSignageAuth
}
