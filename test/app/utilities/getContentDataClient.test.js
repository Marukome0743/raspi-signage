import { describe, expect, mock, test } from "bun:test"
import fc from "fast-check"

const state = {
  queryResult: { data: null, error: null },
  authResult: { data: { user: null }, error: null },
  table: null,
}

const createBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    in: () => builder,
    limit: () => builder,
    single: () => Promise.resolve(state.queryResult),
    then: (resolve) => resolve(state.queryResult),
  }
  return builder
}

mock.module("../../../src/supabase/client", () => ({
  supabase: {
    from: (table) => {
      state.table = table
      return createBuilder()
    },
    auth: {
      signInWithPassword: () => Promise.resolve(state.authResult),
    },
  },
}))

const {
  getContentsDataClient,
  getContentDataClient,
  getOrderIdClient,
  getContentPixelSizeId,
  getContentPixelSize,
  getUserAccountList,
  getAccountDataClient,
  getAccountLoginData,
  getContentList,
} = await import("../../../utilities/getContentDataClient")

describe("getContentsDataClient", () => {
  test("returns data array when contents exist", async () => {
    state.queryResult = {
      data: [
        { area_id: "0", area_name: "関東", deleted: false },
        { area_id: "1", area_name: "関西", deleted: false },
      ],
      error: null,
    }
    const result = await getContentsDataClient("contents")
    expect(result).toHaveLength(2)
  })

  test("returns null when no data", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getContentsDataClient("contents")
    expect(result).toBeNull()
  })
})

describe("getContentDataClient", () => {
  test("queries orders table with correct id", async () => {
    const mockOrder = { id: "abc-123", set1: [], hidden: [] }
    state.queryResult = { data: mockOrder, error: null }
    const result = await getContentDataClient("/order/abc-123")
    expect(state.table).toBe("orders")
    expect(result).toEqual(mockOrder)
  })

  test("returns null for non-order target", async () => {
    const result = await getContentDataClient("/unknown/abc")
    expect(result).toBeNull()
  })
})

describe("getOrderIdClient", () => {
  test("returns order_id for given areaId", async () => {
    state.queryResult = { data: { order_id: "order-1" }, error: null }
    const result = await getOrderIdClient("0")
    expect(result).toBe("order-1")
  })

  test("returns empty string when no data", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getOrderIdClient("999")
    expect(result).toBe("")
  })
})

describe("getContentPixelSizeId", () => {
  test("returns pixel_size_id for given orderId", async () => {
    state.queryResult = { data: { pixel_size_id: "ps-1" }, error: null }
    const result = await getContentPixelSizeId("order-1")
    expect(result).toBe("ps-1")
  })

  test("returns empty string when no data", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getContentPixelSizeId("nonexistent")
    expect(result).toBe("")
  })
})

describe("getContentPixelSize", () => {
  test("maps snake_case DB fields to camelCase", async () => {
    state.queryResult = {
      data: {
        width: 1920,
        height: 1080,
        pixel_width: 1920,
        pixel_height: 1080,
        margin_top: 0,
        margin_left: 0,
        display_content_flg: true,
        get_pixel_flg: false,
      },
      error: null,
    }
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
    state.queryResult = { data: null, error: null }
    const result = await getContentPixelSize("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getUserAccountList", () => {
  test("maps DB user fields to expected format", async () => {
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
    const result = await getUserAccountList("users")
    expect(result[0].uid).toBe("uid-1")
    expect(result[0].userName).toBe("テスト")
    expect(result[0].management).toBe(true)
  })

  test("returns null when no data", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getUserAccountList("users")
    expect(result).toBeNull()
  })
})

describe("getAccountDataClient", () => {
  test("returns mapped user data for valid uid", async () => {
    state.queryResult = {
      data: {
        email: "admin@example.com",
        user_name: "管理者",
        management: true,
        coverage_area: ["0", "1"],
        pass_flg: false,
        deleted: false,
      },
      error: null,
    }
    const result = await getAccountDataClient("uid-1")
    expect(result.userName).toBe("管理者")
    expect(result.coverageArea).toEqual(["0", "1"])
  })

  test("returns null when user not found", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getAccountDataClient("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getAccountLoginData", () => {
  test("returns user data on successful login", async () => {
    state.authResult = { data: { user: { id: "uid-1" } }, error: null }
    state.queryResult = {
      data: {
        email: "admin@example.com",
        user_name: "管理者",
        management: true,
        coverage_area: ["0"],
        pass_flg: false,
        deleted: false,
      },
      error: null,
    }
    const result = await getAccountLoginData(
      "admin@example.com",
      "password123",
    )
    expect(result.uid).toBe("uid-1")
    expect(result.userName).toBe("管理者")
  })

  test("returns null on auth failure", async () => {
    state.authResult = {
      data: { user: null },
      error: { message: "Invalid" },
    }
    const result = await getAccountLoginData("bad@example.com", "wrong")
    expect(result).toBeNull()
  })
})

describe("getContentList", () => {
  test("maps content fields to expected format", async () => {
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
    const result = await getContentList(["0"])
    expect(result[0].areaId).toBe("0")
    expect(result[0].areaName).toBe("関東")
    expect(result[0].orderId).toBe("o1")
  })

  test("returns null when no data", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getContentList(["0"])
    expect(result).toBeNull()
  })
})

describe("Property: getContentDataClient path parsing", () => {
  const orderIdArb = fc.uuid()

  test("always queries orders table for /order/{id} paths", async () => {
    await fc.assert(
      fc.asyncProperty(orderIdArb, async (id) => {
        state.queryResult = { data: { id, set1: [], hidden: [] }, error: null }
        await getContentDataClient(`/order/${id}`)
        expect(state.table).toBe("orders")
      }),
      { numRuns: 50 },
    )
  })
})
