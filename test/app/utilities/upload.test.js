import { describe, expect, mock, test } from "bun:test"

const state = {
  uploadedPath: null,
  uploadError: null,
  tableResults: {},
}

const createBuilder = (table) => {
  const builder = {
    select: () => builder,
    update: () => builder,
    eq: () => builder,
    limit: () => builder,
    single: () => Promise.resolve(state.tableResults[table] ?? { data: null, error: null }),
  }
  return builder
}

mock.module("../../../src/supabase/client", () => ({
  supabase: {
    from: (table) => createBuilder(table),
    storage: {
      from: () => ({
        upload: (path, _content, _opts) => {
          state.uploadedPath = path
          return Promise.resolve({ error: state.uploadError })
        },
        getPublicUrl: (path) => ({
          data: { publicUrl: `http://localhost:54321/storage/v1/object/public/signage-contents/${path}` },
        }),
      }),
    },
  },
}))

mock.module("../../../utilities/setContentData", () => ({
  updateContentOrder: mock(() => Promise.resolve()),
}))

const { postContent } = await import("../../../utilities/upload")
const { updateContentOrder } = await import(
  "../../../utilities/setContentData"
)

describe("postContent", () => {
  test("returns early when content has no name", async () => {
    updateContentOrder.mockClear()
    await postContent("doc-1", {}, "image", 0)
    expect(updateContentOrder).not.toHaveBeenCalled()
  })

  test("returns early when contents not found", async () => {
    state.tableResults = {}
    updateContentOrder.mockClear()
    await postContent("doc-1", { name: "test.png" }, "image", 0)
    expect(updateContentOrder).not.toHaveBeenCalled()
  })

  test("returns early on upload error", async () => {
    state.tableResults = {
      contents: { data: { area_id: "0" }, error: null },
    }
    state.uploadError = { message: "fail" }
    updateContentOrder.mockClear()
    await postContent("doc-1", { name: "test.png" }, "image", 0)
    expect(updateContentOrder).not.toHaveBeenCalled()
  })

  test("uploads file and appends to hidden", async () => {
    state.uploadError = null
    state.tableResults = {
      contents: { data: { area_id: "0" }, error: null },
      orders: { data: { hidden: [{ fileName: "old.png" }] }, error: null },
    }
    updateContentOrder.mockClear()
    await postContent("doc-1", { name: "new.png" }, "image", 5000)
    expect(state.uploadedPath).toBe("0/new.png")
    expect(updateContentOrder).toHaveBeenCalledWith("doc-1", {
      hidden: [
        { fileName: "old.png" },
        {
          fileName: "new.png",
          path: "http://localhost:54321/storage/v1/object/public/signage-contents/0/new.png",
          type: "image",
          viewTime: 5000,
        },
      ],
    })
  })

  test("uses default viewTime of 2000 when duration is 0", async () => {
    state.uploadError = null
    state.tableResults = {
      contents: { data: { area_id: "1" }, error: null },
      orders: { data: { hidden: [] }, error: null },
    }
    updateContentOrder.mockClear()
    await postContent("doc-1", { name: "vid.mp4" }, "video", 0)
    const call = updateContentOrder.mock.calls[0]
    expect(call[1].hidden[0].viewTime).toBe(2000)
  })
})
