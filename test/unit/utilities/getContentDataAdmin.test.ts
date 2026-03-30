import { describe, expect, mock, test } from "bun:test"
import fc from "fast-check"

interface QueryResult {
  data: Record<string, unknown> | null
  error: { message: string } | null
}

const state: {
  table: string | null
  queryResult: QueryResult
} = {
  table: null,
  queryResult: { data: null, error: null },
}

const createBuilder = () => {
  const builder: Record<string, unknown> = {
    select: () => builder,
    eq: () => builder,
    limit: () => builder,
    single: () => Promise.resolve(state.queryResult),
  }
  return builder
}

mock.module("../../../src/supabase/server", () => ({
  supabaseAdmin: {
    from: (table: string) => {
      state.table = table
      return createBuilder()
    },
  },
}))

const { getContentDataAdmin, getOrderIdAdmin } = await import(
  "../../../utilities/getContentDataAdmin"
)

describe("getContentDataAdmin", () => {
  test("returns order data for valid orderId", async () => {
    const mockOrder = { id: "order-1", set1: [], hidden: [] }
    state.queryResult = { data: mockOrder, error: null }
    const result = await getContentDataAdmin("order-1")
    expect(state.table).toBe("orders")
    expect(result).toEqual(mockOrder)
  })

  test("returns null when not found", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getContentDataAdmin("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getOrderIdAdmin", () => {
  test("returns orderId and pixelSizeId", async () => {
    state.queryResult = {
      data: { order_id: "o1", pixel_size_id: "p1" },
      error: null,
    }
    const result = await getOrderIdAdmin("0")
    expect(state.table).toBe("contents")
    expect(result).toEqual({ orderId: "o1", pixelSizeId: "p1" })
  })

  test("returns empty strings when no data", async () => {
    state.queryResult = { data: null, error: null }
    const result = await getOrderIdAdmin("999")
    expect(result).toEqual({ orderId: "", pixelSizeId: "" })
  })
})

describe("Property: getContentDataAdmin always queries orders", () => {
  test("always targets orders table", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (id: string) => {
        state.queryResult = { data: { id, set1: [], hidden: [] }, error: null }
        await getContentDataAdmin(id)
        expect(state.table).toBe("orders")
      }),
      { numRuns: 50 },
    )
  })
})
