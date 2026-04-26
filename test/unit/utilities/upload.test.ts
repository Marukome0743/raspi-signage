import { describe, expect, mock, test } from "bun:test"

interface State {
  contentsRow: Record<string, unknown> | null
  orderRow: Record<string, unknown> | null
  uploadCalls: { prefix: string; fileName: string }[]
  uploadError: Error | null
  updateContentOrderCalls: unknown[]
}

const state: State = {
  contentsRow: null,
  orderRow: null,
  uploadCalls: [],
  uploadError: null,
  updateContentOrderCalls: [],
}

mock.module("../../../src/db/client", () => ({
  queryOne: async (text: string) => {
    if (text.includes("FROM contents")) {
      return state.contentsRow
    }
    if (text.includes("FROM orders")) {
      return state.orderRow
    }
    return null
  },
  query: async () => ({ rows: [] }),
  queryRows: async () => [],
}))

mock.module("../../../src/storage", () => ({
  getStorage: () => ({
    upload: async (
      prefix: string,
      fileName: string,
      _body: unknown,
      _ct?: string,
    ) => {
      state.uploadCalls.push({ prefix, fileName })
      if (state.uploadError) {
        throw state.uploadError
      }
      return {
        key: `${prefix}/${fileName}`,
        url: `http://localhost:9000/signage-contents/${prefix}/${fileName}`,
      }
    },
    list: async () => [],
  }),
}))

mock.module("../../../src/services/contents", () => ({
  updateContentOrder: async (
    docId: string,
    content: Record<string, unknown>,
  ) => {
    state.updateContentOrderCalls.push([docId, content])
  },
}))

const { postContent } = await import("../../../src/services/upload")

function reset() {
  state.contentsRow = null
  state.orderRow = null
  state.uploadCalls = []
  state.uploadError = null
  state.updateContentOrderCalls = []
}

describe("postContent", () => {
  test("returns early when content has no name", async () => {
    reset()
    await postContent("doc-1", {} as File, "image", 0)
    expect(state.updateContentOrderCalls).toHaveLength(0)
    expect(state.uploadCalls).toHaveLength(0)
  })

  test("returns early when contents not found", async () => {
    reset()
    state.contentsRow = null
    await postContent("doc-1", { name: "test.png" } as File, "image", 0)
    expect(state.updateContentOrderCalls).toHaveLength(0)
  })

  test("returns early on upload error", async () => {
    reset()
    state.contentsRow = { area_id: "0" }
    state.uploadError = new Error("fail")
    await postContent("doc-1", { name: "test.png" } as File, "image", 0)
    expect(state.updateContentOrderCalls).toHaveLength(0)
  })

  test("uploads file and appends to hidden", async () => {
    reset()
    state.contentsRow = { area_id: "0" }
    state.orderRow = { hidden: [{ fileName: "old.png" }] }
    await postContent("doc-1", { name: "new.png" } as File, "image", 5000)
    expect(state.uploadCalls).toEqual([{ prefix: "0", fileName: "new.png" }])
    expect(state.updateContentOrderCalls).toHaveLength(1)
    const [docId, content] = state.updateContentOrderCalls[0] as [
      string,
      { hidden: Record<string, unknown>[] },
    ]
    expect(docId).toBe("doc-1")
    expect(content.hidden).toHaveLength(2)
    expect(content.hidden[1]).toEqual({
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
    const [, content] = state.updateContentOrderCalls[0] as [
      string,
      { hidden: { viewTime: number }[] },
    ]
    expect(content.hidden[0].viewTime).toBe(2000)
  })
})
