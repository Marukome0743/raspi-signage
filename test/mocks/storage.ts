// Shared, completeness-guaranteed mock for `@/src/storage`.
// See `test/mocks/db-client.ts` for the full rationale (bun:test mock.module is process-global and
// the first registration fixes the exported-name set, so every mock must cover the whole surface).
import { mock } from "bun:test"
import type { StorageDriver } from "@/src/storage"

type Storage = typeof import("@/src/storage")

export function createStorageMock(
  driver: Partial<StorageDriver> = {},
): Storage {
  const defaultDriver: StorageDriver = {
    upload: async (prefix, fileName) => ({
      key: `${prefix}/${fileName}`,
      url: "",
    }),
    list: async () => [],
  }
  return { getStorage: () => ({ ...defaultDriver, ...driver }) }
}

export function mockStorage(driver?: Partial<StorageDriver>): void {
  mock.module("@/src/storage", () => createStorageMock(driver))
}
