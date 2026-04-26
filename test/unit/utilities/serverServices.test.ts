import { describe, expect, mock, test } from "bun:test"

interface State {
  text: string | null
  rows: Record<string, unknown>[]
}

const state: State = {
  text: null,
  rows: [],
}

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

const { getContentsDataServer, getContentListServer, getOrderByIdServer } =
  await import("../../../src/services/contents-server")

const { getUserAccountListServer } = await import(
  "../../../src/services/users-server"
)

describe("getContentsDataServer", () => {
  test("queries contents table and returns data", async () => {
    state.rows = [
      {
        area_id: "0",
        area_name: "関東",
        order_id: "o1",
        pixel_size_id: "p1",
        deleted: false,
      },
    ]
    const result = await getContentsDataServer()
    expect(state.text).toContain("FROM contents")
    expect(result).toHaveLength(1)
    expect(result[0].area_id).toBe("0")
  })
})

describe("getContentListServer", () => {
  test("queries contents table and maps to ContentListItem", async () => {
    state.rows = [
      {
        area_id: "1",
        area_name: "関西",
        order_id: "o2",
        pixel_size_id: null,
        deleted: false,
      },
    ]
    const result = await getContentListServer(["1"])
    expect(state.text).toContain("FROM contents")
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

  test("returns empty array when coverageAreaList is empty", async () => {
    state.rows = []
    const result = await getContentListServer([])
    expect(result).toEqual([])
  })
})

describe("getOrderByIdServer", () => {
  test("queries orders table with correct id", async () => {
    const mockOrder = { id: "abc-123", set1: [], hidden: [] }
    state.rows = [mockOrder]
    const result = await getOrderByIdServer("abc-123")
    expect(state.text).toContain("FROM orders")
    expect(result).toEqual(mockOrder)
  })
})

describe("getUserAccountListServer", () => {
  test("queries user table and maps to UserAccount", async () => {
    state.rows = [
      {
        id: "uid-1",
        email: "test@example.com",
        user_name: "テスト",
        management: true,
        coverage_area: ["0"],
        pass_flg: false,
        deleted: false,
      },
    ]
    const result = await getUserAccountListServer()
    expect(state.text).toContain('"user"')
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
})
