import { describe, expect, test } from "bun:test"
import { mockGuard } from "../../mocks/auth-guard"
import { mockDbClient } from "../../mocks/db-client"
import { mockStorage } from "../../mocks/storage"

interface QueryCall {
  text: string
  params: unknown[] | null
}

interface State {
  contentsRow: Record<string, unknown> | null
  orderRow: Record<string, unknown> | null
  uploadCalls: { prefix: string; fileName: string }[]
  uploadError: Error | null
  queryCalls: QueryCall[]
}

const state: State = {
  contentsRow: null,
  orderRow: null,
  uploadCalls: [],
  uploadError: null,
  queryCalls: [],
}

mockDbClient({
  query: async (text: string, params?: unknown[]) => {
    state.queryCalls.push({ text, params: params ?? null })
    return { rows: [] }
  },
  queryOne: async (text: string) => {
    if (text.includes("FROM contents")) {
      return state.contentsRow
    }
    if (text.includes("FROM orders")) {
      return state.orderRow
    }
    return null
  },
})

mockStorage({
  upload: async (prefix: string, fileName: string) => {
    state.uploadCalls.push({ prefix, fileName })
    if (state.uploadError) {
      throw state.uploadError
    }
    return {
      key: `${prefix}/${fileName}`,
      url: `http://localhost:9000/signage-contents/${prefix}/${fileName}`,
    }
  },
})

mockGuard()

const { postContent } = await import("../../../src/services/upload")

function reset() {
  state.contentsRow = null
  state.orderRow = null
  state.uploadCalls = []
  state.uploadError = null
  state.queryCalls = []
}

// `updateContentOrder` emits `UPDATE orders SET hidden = $n::jsonb WHERE id = $last`
// with the hidden list JSON-encoded. Recover the call the way the old
// `updateContentOrder` stub used to record it.
function orderUpdates(): {
  docId: string
  hidden: Record<string, unknown>[]
}[] {
  return state.queryCalls
    .filter((call) => call.text.includes("UPDATE orders"))
    .map((call) => {
      const hiddenIndex = call.text.match(/hidden = \$(\d+)::jsonb/)?.[1]
      if (!hiddenIndex) {
        throw new Error(`no hidden assignment in query: ${call.text}`)
      }
      return {
        docId: call.params?.at(-1) as string,
        hidden: JSON.parse(
          call.params?.[Number(hiddenIndex) - 1] as string,
        ) as Record<string, unknown>[],
      }
    })
}

describe("postContent", () => {
  test("returns early when content has no name", async () => {
    reset()
    await postContent("doc-1", {} as File, "image", 0)
    expect(orderUpdates()).toHaveLength(0)
    expect(state.uploadCalls).toHaveLength(0)
  })

  test("returns early when contents not found", async () => {
    reset()
    state.contentsRow = null
    await postContent("doc-1", { name: "test.png" } as File, "image", 0)
    expect(orderUpdates()).toHaveLength(0)
  })

  test("returns early on upload error", async () => {
    reset()
    state.contentsRow = { area_id: "0" }
    state.uploadError = new Error("fail")
    await postContent("doc-1", { name: "test.png" } as File, "image", 0)
    expect(orderUpdates()).toHaveLength(0)
  })

  test("uploads file and appends to hidden", async () => {
    reset()
    state.contentsRow = { area_id: "0" }
    state.orderRow = { hidden: [{ fileName: "old.png" }] }
    await postContent("doc-1", { name: "new.png" } as File, "image", 5000)
    expect(state.uploadCalls).toEqual([{ prefix: "0", fileName: "new.png" }])
    const updates = orderUpdates()
    expect(updates).toHaveLength(1)
    expect(updates[0].docId).toBe("doc-1")
    expect(updates[0].hidden).toHaveLength(2)
    expect(updates[0].hidden[1]).toEqual({
      fileName: "new.png",
      path: "http://localhost:9000/signage-contents/0/new.png",
      type: "image",
      viewTime: 5000,
    })
  })

  test("uses default viewTime of 2000 when duration is 0", async () => {
    reset()
    state.contentsRow = { area_id: "1" }
    state.orderRow = { hidden: [] }
    await postContent("doc-1", { name: "vid.mp4" } as File, "video", 0)
    expect(orderUpdates()[0].hidden[0].viewTime).toBe(2000)
  })
})
