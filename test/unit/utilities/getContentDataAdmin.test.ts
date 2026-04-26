import { describe, expect, mock, test } from "bun:test"
import fc from "fast-check"

interface QueryRecorder {
  text: string | null
  params: unknown[] | null
  result: { rows: Record<string, unknown>[] }
}

const state: QueryRecorder = {
  text: null,
  params: null,
  result: { rows: [] },
}

mock.module("../../../src/db/client", () => ({
  query: async (text: string, params?: unknown[]) => {
    state.text = text
    state.params = params ?? null
    return state.result
  },
  queryRows: async (text: string, params?: unknown[]) => {
    state.text = text
    state.params = params ?? null
    return state.result.rows
  },
  queryOne: async (text: string, params?: unknown[]) => {
    state.text = text
    state.params = params ?? null
    return state.result.rows[0] ?? null
  },
}))

const { getContentDataAdmin, getOrderIdAdmin } = await import(
  "../../../src/services/contents-admin"
)

describe("getContentDataAdmin", () => {
  test("returns order data for valid orderId", async () => {
    const mockOrder = { id: "order-1", set1: [], hidden: [] }
    state.result = { rows: [mockOrder] }
    const result = await getContentDataAdmin("order-1")
    expect(state.text).toContain("FROM orders")
    expect(result).toEqual(mockOrder)
  })

  test("returns null when not found", async () => {
    state.result = { rows: [] }
    const result = await getContentDataAdmin("nonexistent")
    expect(result).toBeNull()
  })
})

describe("getOrderIdAdmin", () => {
  test("returns orderId and pixelSizeId", async () => {
    state.result = {
      rows: [{ order_id: "o1", pixel_size_id: "p1" }],
    }
    const result = await getOrderIdAdmin("0")
    expect(state.text).toContain("FROM contents")
    expect(result).toEqual({ orderId: "o1", pixelSizeId: "p1" })
  })

  test("returns empty strings when no data", async () => {
    state.result = { rows: [] }
    const result = await getOrderIdAdmin("999")
    expect(result).toEqual({ orderId: "", pixelSizeId: "" })
  })
})

describe("Property: getContentDataAdmin always queries orders", () => {
  test("always targets orders table", async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (id: string) => {
        state.result = { rows: [{ id, set1: [], hidden: [] }] }
        await getContentDataAdmin(id)
        expect(state.text).toContain("FROM orders")
      }),
      { numRuns: 50 },
    )
  })
})
