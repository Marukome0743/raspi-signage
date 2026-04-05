import { describe, expect, mock, test } from "bun:test"

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

mock.module("@/src/supabase/server", () => ({
  createClient: async () => mockClient(),
}))

mock.module("../../../src/supabase/server", () => ({
  createClient: async () => mockClient(),
}))

mock.module("@/src/supabase/client", () => ({
  createClient: () => mockClient(),
}))

mock.module("../../../src/supabase/client", () => ({
  createClient: () => mockClient(),
}))

const { getContentsDataServer, getContentListServer, getOrderByIdServer } =
  await import("../../../src/services/contents-server")

const { getUserAccountListServer } = await import(
  "../../../src/services/users-server"
)

describe("getContentsDataServer", () => {
  test("queries contents table and returns data", async () => {
    state.queryResult = {
      data: [
        {
          area_id: "0",
          area_name: "関東",
          order_id: "o1",
          pixel_size_id: "p1",
          deleted: false,
        },
      ],
      error: null,
    }
    const result = await getContentsDataServer()
    expect(state.table).toBe("contents")
    expect(result).toHaveLength(1)
    expect(result[0].area_id).toBe("0")
  })

  test("throws on error", async () => {
    state.queryResult = { data: null, error: { message: "db error" } }
    await expect(getContentsDataServer()).rejects.toThrow("db error")
  })
})

describe("getContentListServer", () => {
  test("queries contents table and maps to ContentListItem", async () => {
    state.queryResult = {
      data: [
        {
          area_id: "1",
          area_name: "関西",
          order_id: "o2",
          pixel_size_id: null,
          deleted: false,
        },
      ],
      error: null,
    }
    const result = await getContentListServer(["1"])
    expect(state.table).toBe("contents")
    expect(result).toEqual([
      {
        areaId: "1",
        areaName: "関西",
        orderId: "o2",
        pixelSizeId: null,
        delete: false,
      },
    ])
  })

  test("returns empty array when no data", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getContentListServer(["0"])
    expect(result).toEqual([])
  })

  test("throws on error", async () => {
    state.queryResult = { data: null, error: { message: "query failed" } }
    await expect(getContentListServer(["0"])).rejects.toThrow("query failed")
  })
})

describe("getOrderByIdServer", () => {
  test("queries orders table with correct id", async () => {
    const mockOrder = { id: "abc-123", set1: [], hidden: [] }
    state.queryResult = { data: mockOrder, error: null }
    const result = await getOrderByIdServer("abc-123")
    expect(state.table).toBe("orders")
    expect(result).toEqual(mockOrder)
  })

  test("throws on error", async () => {
    state.queryResult = { data: null, error: { message: "not found" } }
    await expect(getOrderByIdServer("nonexistent")).rejects.toThrow("not found")
  })
})

describe("getUserAccountListServer", () => {
  test("queries users table and maps to UserAccount", async () => {
    state.queryResult = {
      data: [
        {
          id: "uid-1",
          email: "test@example.com",
          user_name: "テスト",
          management: true,
          coverage_area: ["0"],
          pass_flg: false,
          deleted: false,
        },
      ],
      error: null,
    }
    const result = await getUserAccountListServer()
    expect(state.table).toBe("users")
    expect(result).toEqual([
      {
        uid: "uid-1",
        email: "test@example.com",
        userName: "テスト",
        management: true,
        coverageArea: ["0"],
        passFlg: false,
        delete: false,
      },
    ])
  })

  test("returns empty array when no data", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getUserAccountListServer()
    expect(result).toEqual([])
  })

  test("throws on error", async () => {
    state.queryResult = { data: null, error: { message: "auth error" } }
    await expect(getUserAccountListServer()).rejects.toThrow("auth error")
  })
})
