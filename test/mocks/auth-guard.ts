// Shared, completeness-guaranteed mock for `@/src/auth/guard`.
// See `test/mocks/db-client.ts` for the full rationale (bun:test mock.module is process-global and
// the first registration fixes the exported-name set, so every mock must cover the whole surface).
import { mock } from "bun:test"
import type { SessionPayload } from "@/src/auth/guard"

type Guard = typeof import("@/src/auth/guard")

const defaultSession: SessionPayload = {
  user: { id: "test-uid", email: "test@example.com" },
}

export function createGuardMock(
  session: SessionPayload = defaultSession,
): Guard {
  return {
    requireSession: async () => session,
    requireAdmin: async () => session,
    requireSelfOrAdmin: async () => session,
    requireSelf: async () => session,
    requireEmail: async () => session,
  }
}

export function mockGuard(session?: SessionPayload): void {
  mock.module("@/src/auth/guard", () => createGuardMock(session))
}
