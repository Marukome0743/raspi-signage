// Shared, completeness-guaranteed mock for `@/src/db/client`.
//
// WHY THIS EXISTS — bun:test mock.module gotcha (empirically established, see #445):
//   `mock.module` is PROCESS-GLOBAL. On `bun-version: canary` the FIRST registration's object
//   shape fixes the module's exported-name set for the whole run. If that first shape omits an
//   export (historically `withTransaction`, omitted only by getContentDataAdmin.test.ts), any later
//   file whose graph statically imports the missing name fails to LINK:
//   `SyntaxError: Export named 'withTransaction' not found in module 'src/db/client.ts'`.
//   The export exists in source — this is a test-mock-completeness bug, and it is file-ORDER
//   dependent (does not reproduce on stable 1.3.14 / local canary 1.4.0).
//   A relative specifier and the `@/*` alias resolve to the SAME registry key, so mocking the
//   alias alone covers every importer.
//
//   Fix-by-construction: declare the COMPLETE surface in ONE place. The `DbClientMock` key type
//   (below) makes "forgot an export" a COMPILE error, so a registration can never be partial.
import { mock } from "bun:test"

type DbClient = typeof import("@/src/db/client")

// Loose values (mocks intentionally return simplified shapes that don't satisfy pg's full
// `QueryResult`/`readonly` signatures) but the EXACT key set: if db/client gains or renames an
// export, `keyof DbClient` changes and `defaults` below fails to compile — that compile error is
// the completeness guarantee, without forcing every mock closure to match the real signatures.
type DbClientMock = Record<keyof DbClient, unknown>

export function createDbClientMock(
  overrides: Partial<DbClientMock> = {},
): DbClient {
  const defaults: DbClientMock = {
    query: async () => ({ rows: [] }),
    queryRows: async () => [],
    queryOne: async () => null,
    withTransaction: async <T>(
      fn: (client: {
        query: (
          text: string,
          params?: unknown[],
        ) => Promise<{ rows: Record<string, unknown>[] }>
      }) => Promise<T>,
    ) => fn({ query: async () => ({ rows: [] }) }),
    getPool: () => {
      throw new Error(
        "getPool is not mocked in unit tests; mock query/queryRows/queryOne/withTransaction instead",
      )
    },
  }
  return { ...defaults, ...overrides } as unknown as DbClient
}

export function mockDbClient(overrides: Partial<DbClientMock> = {}): void {
  mock.module("@/src/db/client", () => createDbClientMock(overrides))
}
