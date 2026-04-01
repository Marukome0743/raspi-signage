import { describe, expect, mock, test } from "bun:test"

interface QueryResult {
  data: Record<string, unknown> | null
  error: { message: string } | null
}

const state: {
  uploadedPath: string | null
  uploadError: { message: string } | null
  tableResults: Record<string, QueryResult>
} = {
  uploadedPath: null,
  uploadError: null,
  tableResults: {},
}

const createBuilder = (table: string) => {
  const builder: Record<string, unknown> = {
    select: () => builder,
    update: () => builder,
    eq: () => builder,
    limit: () => builder,
    single: () =>
      Promise.resolve(state.tableResults[table] ?? { data: null, error: null }),
  }
  return builder
}

mock.module("../../../src/supabase/client", () => ({
  createClient: () => ({
    from: (table: string) => createBuilder(table),
    storage: {
      from: () => ({
        upload: (path: string) => {
          state.uploadedPath = path
          return Promise.resolve({ error: state.uploadError })
        },
        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: `http://localhost:54321/storage/v1/object/public/signage-contents/${path}`,
          },
        }),
      }),
    },
  }),
}))

mock.module("../../../src/services/contents", () => ({
  updateContentOrder: mock(() => Promise.resolve()),
}))

const { postContent } = await import("../../../src/services/upload")
const { updateContentOrder } = (await import(
  "../../../src/services/contents"
)) as {
  updateContentOrder: ReturnType<typeof mock> &
    ((...args: unknown[]) => Promise<void>)
}

describe("postContent", () => {
  test("returns early when content has no name", async () => {
    ;(updateContentOrder as ReturnType<typeof mock>).mockClear()
    await postContent("doc-1", {} as File, "image", 0)
    expect(updateContentOrder).not.toHaveBeenCalled()
  })

  test("returns early when contents not found", async () => {
    state.tableResults = {}
    ;(updateContentOrder as ReturnType<typeof mock>).mockClear()
    await postContent("doc-1", { name: "test.png" } as File, "image", 0)
    expect(updateContentOrder).not.toHaveBeenCalled()
  })

  test("returns early on upload error", async () => {
    state.tableResults = {
      contents: { data: { area_id: "0" }, error: null },
    }
    state.uploadError = { message: "fail" }
    ;(updateContentOrder as ReturnType<typeof mock>).mockClear()
    await postContent("doc-1", { name: "test.png" } as File, "image", 0)
    expect(updateContentOrder).not.toHaveBeenCalled()
  })

  test("uploads file and appends to hidden", async () => {
    state.uploadError = null
    state.tableResults = {
      contents: { data: { area_id: "0" }, error: null },
      orders: { data: { hidden: [{ fileName: "old.png" }] }, error: null },
    }
    ;(updateContentOrder as ReturnType<typeof mock>).mockClear()
    await postContent("doc-1", { name: "new.png" } as File, "image", 5000)
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
    ;(updateContentOrder as ReturnType<typeof mock>).mockClear()
    await postContent("doc-1", { name: "vid.mp4" } as File, "video", 0)
    const calls = (updateContentOrder as ReturnType<typeof mock>).mock.calls
    const call = calls[0] as [string, { hidden: { viewTime: number }[] }]
    expect(call[1].hidden[0].viewTime).toBe(2000)
  })
})
