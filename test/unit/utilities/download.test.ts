import { describe, expect, mock, test } from "bun:test"

interface State {
  listResult: { key: string; url: string }[]
  listError: Error | null
}

const state: State = {
  listResult: [],
  listError: null,
}

mock.module("../../../src/storage", () => ({
  getStorage: () => ({
    upload: async () => ({ key: "", url: "" }),
    list: async () => {
      if (state.listError) {
        throw state.listError
      }
      return state.listResult
    },
  }),
}))

const { downLoadURLList } = await import("../../../src/services/download")

describe("downLoadURLList", () => {
  test("returns public URLs for files in area", async () => {
    state.listError = null
    state.listResult = [
      {
        key: "0/a.png",
        url: "http://localhost:9000/signage-contents/0/a.png",
      },
      {
        key: "0/b.mp4",
        url: "http://localhost:9000/signage-contents/0/b.mp4",
      },
    ]
    const result = await downLoadURLList({ areaId: "0" })
    expect(result).toEqual([
      "http://localhost:9000/signage-contents/0/a.png",
      "http://localhost:9000/signage-contents/0/b.mp4",
    ])
  })

  test("returns empty array on error", async () => {
    state.listError = new Error("fail")
    state.listResult = []
    const result = await downLoadURLList({ areaId: "0" })
    expect(result).toEqual([])
  })

  test("returns empty array when no files", async () => {
    state.listError = null
    state.listResult = []
    const result = await downLoadURLList({ areaId: "0" })
    expect(result).toEqual([])
  })
})
