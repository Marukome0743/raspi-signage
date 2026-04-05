import { describe, expect, mock, test } from "bun:test"
import * as fc from "fast-check"

/**
 * Property 2: サーバーサイドデータ取得関数のデータ構造互換性
 *
 * 任意の有効な入力パラメータに対して、サーバーサイド用データ取得関数は
 * 対応するクライアントサイド関数と同一のデータ構造を返す。
 *
 * **Validates: Requirements 3.5**
 */

interface QueryResult {
  data: Record<string, unknown> | Record<string, unknown>[] | null
  error: { message: string } | null
}

const state: {
  queryResult: QueryResult
  table: string | null
} = {
  queryResult: { data: null, error: null },
  table: null,
}

const createBuilder = () => {
  const result = () => Promise.resolve(state.queryResult)
  const builder: unknown = new Proxy(result, {
    get(_target: unknown, prop: string) {
      if (prop === "then") {
        return (resolve: (value: QueryResult) => void) =>
          resolve(state.queryResult)
      }
      return () => builder
    },
  })
  return builder
}

const mockClient = () => ({
  from: (table: string) => {
    state.table = table
    return createBuilder()
  },
})

mock.module("@/src/supabase/client", () => ({
  createClient: () => mockClient(),
}))

mock.module("@/src/supabase/server", () => ({
  createClient: async () => mockClient(),
}))

mock.module("../../../src/supabase/client", () => ({
  createClient: () => mockClient(),
}))

mock.module("../../../src/supabase/server", () => ({
  createClient: async () => mockClient(),
}))

const { getContentsDataClient, getContentList, getOrderById } = await import(
  "../../../src/services/contents"
)

const { getContentsDataServer, getContentListServer, getOrderByIdServer } =
  await import("../../../src/services/contents-server")

const { getUserAccountList } = await import("../../../src/services/users")

const { getUserAccountListServer } = await import(
  "../../../src/services/users-server"
)

// Arbitrary generators for DB row shapes
const contentRowArb = fc.record({
  area_id: fc.string({ minLength: 1, maxLength: 5 }),
  area_name: fc.string({ minLength: 1, maxLength: 20 }),
  order_id: fc.uuid(),
  pixel_size_id: fc.oneof(
    fc.string({ minLength: 1, maxLength: 10 }),
    fc.constant(null),
  ),
  deleted: fc.constant(false),
})

const orderRowArb = fc.record({
  id: fc.uuid(),
  set1: fc.array(
    fc.record({
      fileName: fc.string(),
      path: fc.string(),
      type: fc.constantFrom("image", "video"),
      viewTime: fc.nat(),
    }),
    { maxLength: 3 },
  ),
  hidden: fc.array(
    fc.record({
      fileName: fc.string(),
      path: fc.string(),
      type: fc.constantFrom("image", "video"),
      viewTime: fc.nat(),
    }),
    { maxLength: 3 },
  ),
})

const userRowArb = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  user_name: fc.string({ minLength: 1, maxLength: 20 }),
  management: fc.boolean(),
  coverage_area: fc.array(fc.string({ minLength: 1, maxLength: 5 }), {
    maxLength: 5,
  }),
  pass_flg: fc.boolean(),
  deleted: fc.constant(false),
})

describe("Property 2: サーバーサイドデータ取得関数のデータ構造互換性", () => {
  test("getContentsDataServer returns same structure as getContentsDataClient", () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(contentRowArb, { minLength: 0, maxLength: 5 }),
        async (rows) => {
          state.queryResult = { data: rows, error: null }
          const clientResult = await getContentsDataClient()
          const serverResult = await getContentsDataServer()
          expect(Object.keys(serverResult[0] ?? {}).sort()).toEqual(
            Object.keys(clientResult[0] ?? {}).sort(),
          )
          expect(serverResult).toEqual(clientResult)
        },
      ),
      { numRuns: 100 },
    )
  })

  test("getContentListServer returns same structure as getContentList", () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(contentRowArb, { minLength: 1, maxLength: 5 }),
        fc.array(fc.string({ minLength: 1, maxLength: 5 }), {
          minLength: 1,
          maxLength: 3,
        }),
        async (rows, coverageArea) => {
          state.queryResult = { data: rows, error: null }
          const clientResult = await getContentList(coverageArea)
          const serverResult = await getContentListServer(coverageArea)
          expect(serverResult).toEqual(clientResult)
          if (serverResult.length > 0) {
            const keys = Object.keys(serverResult[0]).sort()
            expect(keys).toEqual([
              "areaId",
              "areaName",
              "delete",
              "orderId",
              "pixelSizeId",
            ])
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  test("getOrderByIdServer returns same structure as getOrderById", () => {
    fc.assert(
      fc.asyncProperty(orderRowArb, async (row) => {
        state.queryResult = { data: row, error: null }
        const clientResult = await getOrderById(row.id)
        const serverResult = await getOrderByIdServer(row.id)
        expect(serverResult).toEqual(clientResult)
      }),
      { numRuns: 100 },
    )
  })

  test("getUserAccountListServer returns same structure as getUserAccountList", () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(userRowArb, { minLength: 1, maxLength: 5 }),
        async (rows) => {
          state.queryResult = { data: rows, error: null }
          const clientResult = await getUserAccountList()
          const serverResult = await getUserAccountListServer()
          expect(serverResult).toEqual(clientResult)
          if (serverResult.length > 0) {
            const keys = Object.keys(serverResult[0]).sort()
            expect(keys).toEqual([
              "coverageArea",
              "delete",
              "email",
              "management",
              "passFlg",
              "uid",
              "userName",
            ])
          }
        },
      ),
      { numRuns: 100 },
    )
  })
})
