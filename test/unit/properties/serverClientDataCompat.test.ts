import { describe, expect, mock, test } from "bun:test"
import * as fc from "fast-check"

interface State {
  rows: Record<string, unknown>[]
  text: string | null
}

const state: State = { rows: [], text: null }

const dbMock = {
  query: async (text: string) => {
    state.text = text
    return { rows: state.rows }
  },
  queryRows: async (text: string) => {
    state.text = text
    return state.rows
  },
  queryOne: async (text: string) => {
    state.text = text
    return state.rows[0] ?? null
  },
}

mock.module("../../../src/db/client", () => dbMock)
mock.module("@/src/db/client", () => dbMock)

const { getContentsDataClient, getContentList, getOrderById } = await import(
  "../../../src/services/contents"
)

const { getContentsDataServer, getContentListServer, getOrderByIdServer } =
  await import("../../../src/services/contents-server")

const { getUserAccountList } = await import("../../../src/services/users")

const { getUserAccountListServer } = await import(
  "../../../src/services/users-server"
)

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

describe("Property 2: server / client services return identical shapes", () => {
  test("getContentsDataServer matches getContentsDataClient", () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(contentRowArb, { minLength: 0, maxLength: 5 }),
        async (rows) => {
          state.rows = rows
          const clientResult = await getContentsDataClient()
          const serverResult = await getContentsDataServer()
          expect(serverResult).toEqual(clientResult)
        },
      ),
      { numRuns: 50 },
    )
  })

  test("getContentListServer matches getContentList", () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(contentRowArb, { minLength: 1, maxLength: 5 }),
        fc.array(fc.string({ minLength: 1, maxLength: 5 }), {
          minLength: 1,
          maxLength: 3,
        }),
        async (rows, coverageArea) => {
          state.rows = rows
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
      { numRuns: 50 },
    )
  })

  test("getOrderByIdServer matches getOrderById", () => {
    fc.assert(
      fc.asyncProperty(orderRowArb, async (row) => {
        state.rows = [row]
        const clientResult = await getOrderById(row.id)
        const serverResult = await getOrderByIdServer(row.id)
        expect(serverResult).toEqual(clientResult)
      }),
      { numRuns: 50 },
    )
  })

  test("getUserAccountListServer matches getUserAccountList", () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(userRowArb, { minLength: 1, maxLength: 5 }),
        async (rows) => {
          state.rows = rows
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
      { numRuns: 50 },
    )
  })
})
