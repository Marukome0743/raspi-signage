import { describe, expect, mock, test } from "bun:test"
import fc from "fast-check"

interface State {
  text: string | null
  params: unknown[] | null
  rows: Record<string, unknown>[]
  signInResult: {
    data?: { user: { id: string } } | null
    error?: { message: string } | null
  }
}

const state: State = {
  text: null,
  params: null,
  rows: [],
  signInResult: { data: null, error: null },
}

const dbMock = {
  query: async (text: string, params?: unknown[]) => {
    state.text = text
    state.params = params ?? null
    return { rows: state.rows }
  },
  queryRows: async (text: string, params?: unknown[]) => {
    state.text = text
    state.params = params ?? null
    return state.rows
  },
  queryOne: async (text: string, params?: unknown[]) => {
    state.text = text
    state.params = params ?? null
    return state.rows[0] ?? null
  },
}

mock.module("../../../src/db/client", () => dbMock)
mock.module("@/src/db/client", () => dbMock)

const authMock = {
  signIn: {
    email: async () => state.signInResult,
  },
}
mock.module("../../../src/auth/client", () => authMock)
mock.module("@/src/auth/client", () => authMock)

const { getUserAccountList } = await import("../../../src/services/users")

const {
  getContentsDataClient,
  getOrderById,
  getContentPixelSizeId,
  getContentPixelSize,
  getContentList,
} = await import("../../../src/services/contents")

const { getAccountDataClient, getAccountLoginData, checkAccountPassKey } =
  await import("../../../src/services/auth")

describe("getContentsDataClient", () => {
  test("returns data array when contents exist", async () => {
    state.rows = [
      { area_id: "0", area_name: "関東", deleted: false },
      { area_id: "1", area_name: "関西", deleted: false },
    ]
    const result = await getContentsDataClient()
    expect(result).toHaveLength(2)
  })

  test("returns empty array when no data", async () => {
    state.rows = []
    const result = await getContentsDataClient()
    expect(result).toEqual([])
  })
})

describe("getOrderById", () => {
  test("queries orders table with correct id", async () => {
    const mockOrder = { id: "abc-123", set1: [], hidden: [] }
    state.rows = [mockOrder]
    const result = await getOrderById("abc-123")
    expect(state.text).toContain("FROM orders")
    expect(result).toEqual(mockOrder)
  })

  test("returns null when not found", async () => {
    state.rows = []
    const result = await getOrderById("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getContentPixelSizeId", () => {
  test("returns pixel_size_id for given orderId", async () => {
    state.rows = [{ pixel_size_id: "ps-1" }]
    const result = await getContentPixelSizeId("order-1")
    expect(result).toBe("ps-1")
  })

  test("returns empty string when no data", async () => {
    state.rows = []
    const result = await getContentPixelSizeId("nonexistent")
    expect(result).toBe("")
  })
})

describe("getContentPixelSize", () => {
  test("maps snake_case DB fields to camelCase", async () => {
    state.rows = [
      {
        width: 1920,
        height: 1080,
        pixel_width: 1920,
        pixel_height: 1080,
        margin_top: 0,
        margin_left: 0,
        display_content_flg: true,
        get_pixel_flg: false,
      },
    ]
    const result = await getContentPixelSize("pixel-1")
    expect(result).toEqual({
      width: 1920,
      height: 1080,
      pixelWidth: 1920,
      pixelHeight: 1080,
      marginTop: 0,
      marginLeft: 0,
      displayContentFlg: true,
      getPixelFlg: false,
    })
  })

  test("returns null when pixel size not found", async () => {
    state.rows = []
    const result = await getContentPixelSize("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getUserAccountList", () => {
  test("maps DB user fields to expected format", async () => {
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
    const result = await getUserAccountList()
    expect(result?.[0].uid).toBe("uid-1")
    expect(result?.[0].userName).toBe("テスト")
    expect(result?.[0].management).toBe(true)
  })

  test("returns empty array when no data", async () => {
    state.rows = []
    const result = await getUserAccountList()
    expect(result).toEqual([])
  })
})

describe("getAccountDataClient", () => {
  test("returns mapped user data for valid uid", async () => {
    state.rows = [
      {
        email: "admin@example.com",
        user_name: "管理者",
        management: true,
        coverage_area: ["0", "1"],
        pass_flg: false,
        deleted: false,
      },
    ]
    const result = await getAccountDataClient("uid-1")
    expect(result?.userName).toBe("管理者")
    expect(result?.coverageArea).toEqual(["0", "1"])
  })

  test("returns null when user not found", async () => {
    state.rows = []
    const result = await getAccountDataClient("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getAccountLoginData", () => {
  test("returns mapped profile for an authenticated uid", async () => {
    state.rows = [
      {
        id: "uid-1",
        email: "admin@example.com",
        user_name: "管理者",
        management: true,
        coverage_area: ["0"],
        pass_flg: false,
        deleted: false,
      },
    ]
    const result = await getAccountLoginData("uid-1")
    expect(result?.uid).toBe("uid-1")
    expect(result?.userName).toBe("管理者")
  })

  test("returns null when no row exists for the uid", async () => {
    state.rows = []
    const result = await getAccountLoginData("missing-uid")
    expect(result).toBeNull()
  })

  test("returns null when user is deleted", async () => {
    state.rows = [
      {
        id: "uid-del",
        email: "del@example.com",
        user_name: "削除済み",
        management: false,
        coverage_area: [],
        pass_flg: false,
        deleted: true,
      },
    ]
    const result = await getAccountLoginData("uid-del")
    expect(result).toBeNull()
  })
})

describe("checkAccountPassKey", () => {
  test("returns user data when pass_flg is true", async () => {
    state.rows = [
      {
        email: "user@example.com",
        user_name: "テスト",
        management: false,
        coverage_area: ["0"],
        pass_flg: true,
      },
    ]
    const result = await checkAccountPassKey("user@example.com")
    expect(result?.email).toBe("user@example.com")
    expect(result?.passFlg).toBe(true)
  })

  test("returns null when no matching user", async () => {
    state.rows = []
    const result = await checkAccountPassKey("nobody@example.com")
    expect(result).toBeNull()
  })
})

describe("getContentList", () => {
  test("maps content fields to expected format", async () => {
    state.rows = [
      {
        area_id: "0",
        area_name: "関東",
        order_id: "o1",
        pixel_size_id: "p1",
        deleted: false,
      },
    ]
    const result = await getContentList(["0"])
    expect(result?.[0].areaId).toBe("0")
    expect(result?.[0].areaName).toBe("関東")
    expect(result?.[0].orderId).toBe("o1")
  })

  test("returns empty array when coverageAreaList is empty", async () => {
    state.rows = []
    const result = await getContentList([])
    expect(result).toEqual([])
  })

  test("returns empty array when no rows match", async () => {
    state.rows = []
    const result = await getContentList(["0"])
    expect(result).toEqual([])
  })
})

describe("Property: getOrderById queries orders table", () => {
  const orderIdArb = fc.uuid()

  test("always queries orders table for any orderId", async () => {
    await fc.assert(
      fc.asyncProperty(orderIdArb, async (id: string) => {
        state.rows = [{ id, set1: [], hidden: [] }]
        await getOrderById(id)
        expect(state.text).toContain("FROM orders")
      }),
      { numRuns: 50 },
    )
  })
})
