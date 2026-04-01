import { describe, expect, mock, test } from "bun:test"

interface StorageListItem {
  name: string
}

interface StorageListResult {
  data: StorageListItem[] | null
  error: { message: string } | null
}

const state: { listResult: StorageListResult } = {
  listResult: { data: null, error: null },
}

mock.module("../../../src/supabase/client", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        list: () => Promise.resolve(state.listResult),
        getPublicUrl: (path: string) => ({
          data: {
            publicUrl: `http://localhost:54321/storage/v1/object/public/signage-contents/${path}`,
          },
        }),
      }),
    },
  }),
}))

const { downLoadURLList } = await import("../../../src/services/download")

describe("downLoadURLList", () => {
  test("returns public URLs for files in area", async () => {
    state.listResult = {
      data: [{ name: "a.png" }, { name: "b.mp4" }],
      error: null,
    }
    const result = await downLoadURLList({ areaId: "0" })
    expect(result).toEqual([
      "http://localhost:54321/storage/v1/object/public/signage-contents/0/a.png",
      "http://localhost:54321/storage/v1/object/public/signage-contents/0/b.mp4",
    ])
  })

  test("returns empty array on error", async () => {
    state.listResult = { data: null, error: { message: "fail" } }
    const result = await downLoadURLList({ areaId: "0" })
    expect(result).toEqual([])
  })

  test("returns empty array when no files", async () => {
    state.listResult = { data: null, error: null }
    const result = await downLoadURLList({ areaId: "0" })
    expect(result).toEqual([])
  })
})
