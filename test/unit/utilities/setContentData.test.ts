import { describe, expect, mock, test } from "bun:test"
import fc from "fast-check"

interface QueryCall {
  text: string
  params: unknown[] | null
}

interface State {
  calls: QueryCall[]
  insertReturning: Record<string, unknown> | null
  countRow: { count: string } | null
  selectRow: Record<string, unknown> | null
  signInResult: { data?: unknown; error?: { message: string } | null }
  signUpResult: {
    data?: { user: { id: string } } | null
    error?: { message: string } | null
  }
  changePasswordResult: { error?: { message: string } | null }
}

const state: State = {
  calls: [],
  insertReturning: null,
  countRow: null,
  selectRow: null,
  signInResult: { error: null },
  signUpResult: { data: { user: { id: "new-uid" } }, error: null },
  changePasswordResult: { error: null },
}

const dbMock = {
  query: async (text: string, params?: unknown[]) => {
    state.calls.push({ text, params: params ?? null })
    return { rows: [] }
  },
  queryRows: async (text: string, params?: unknown[]) => {
    state.calls.push({ text, params: params ?? null })
    return []
  },
  queryOne: async (text: string, params?: unknown[]) => {
    state.calls.push({ text, params: params ?? null })
    if (text.includes("RETURNING id")) {
      return state.insertReturning
    }
    if (text.includes("COUNT(")) {
      return state.countRow
    }
    return state.selectRow
  },
}

mock.module("../../../src/db/client", () => dbMock)
mock.module("@/src/db/client", () => dbMock)

const authServerMock = {
  getAuth: () => ({
    api: {
      signUpEmail: async () => {
        if (state.signUpResult.error) {
          throw new Error(state.signUpResult.error.message)
        }
        return state.signUpResult.data
      },
    },
  }),
}
mock.module("../../../src/auth/server", () => authServerMock)
mock.module("@/src/auth/server", () => authServerMock)

const {
  setContentPixelSize,
  createDisplayContent,
  updateDisplayContent,
  resetPixelSize,
} = await import("../../../src/services/pixel-sizes")

const { createAccountData, updateAccountData, deleteAccountData } =
  await import("../../../src/services/accounts")

const {
  setContentOrder,
  updateContentOrder,
  createContentsData,
  updateContentsData,
  deleteContentsData,
} = await import("../../../src/services/contents")

function reset() {
  state.calls = []
  state.insertReturning = null
  state.countRow = null
  state.selectRow = null
  state.signInResult = { error: null }
  state.signUpResult = { data: { user: { id: "new-uid" } }, error: null }
  state.changePasswordResult = { error: null }
}

describe("setContentOrder", () => {
  test("upserts to orders table", async () => {
    reset()
    await setContentOrder("order-1", {
      set1: [{ fileName: "test.png", path: "p", type: "image", viewTime: 100 }],
    })
    const last = state.calls.at(-1)
    expect(last?.text).toContain("INSERT INTO orders")
    expect(last?.text).toContain("ON CONFLICT")
    expect(last?.params?.[0]).toBe("order-1")
  })
})

describe("updateContentOrder", () => {
  test("updates orders table with eq filter", async () => {
    reset()
    await updateContentOrder("order-1", { hidden: [] })
    const last = state.calls.at(-1)
    expect(last?.text).toContain("UPDATE orders")
    expect(last?.text).toContain("hidden")
  })
})

describe("deleteContentsData", () => {
  test("soft-deletes content by setting deleted=true", async () => {
    reset()
    const contents = [{ orderId: "o1" }, { orderId: "o2" }] as Parameters<
      typeof deleteContentsData
    >[1]
    await deleteContentsData(1, contents)
    const last = state.calls.at(-1)
    expect(last?.text).toContain("UPDATE contents")
    expect(last?.text).toContain("deleted = true")
    expect(last?.params).toEqual(["o2"])
  })
})

describe("deleteAccountData", () => {
  test("soft-deletes user by setting deleted=true", async () => {
    reset()
    await deleteAccountData("uid-1")
    const last = state.calls.at(-1)
    expect(last?.text).toContain('UPDATE "user"')
    expect(last?.text).toContain("deleted = true")
    expect(last?.params).toEqual(["uid-1"])
  })
})

describe("setContentPixelSize", () => {
  test("creates new pixel_size when pixelSizeId is empty", async () => {
    reset()
    state.insertReturning = { id: "new-ps" }
    const result = await setContentPixelSize("order-1", "", 1920, 1080)
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

  test("returns existing pixel data when pixelSizeId provided", async () => {
    reset()
    state.selectRow = {
      width: 800,
      height: 600,
      pixel_width: 800,
      pixel_height: 600,
      margin_top: 10,
      margin_left: 20,
      display_content_flg: true,
      get_pixel_flg: false,
    }
    const result = await setContentPixelSize("order-1", "ps-1", 1920, 1080)
    expect(result?.pixelWidth).toBe(800)
    expect(result?.marginTop).toBe(10)
  })
})

describe("createDisplayContent", () => {
  test("inserts pixel_size and returns merged result", async () => {
    reset()
    state.insertReturning = { id: "new-ps" }
    const pixel = { pixelWidth: 1920, pixelHeight: 1080 }
    const result = await createDisplayContent("order-1", pixel)
    expect(result).toEqual({
      pixelWidth: 1920,
      pixelHeight: 1080,
      width: 0,
      height: 0,
      marginTop: 0,
      marginLeft: 0,
      displayContentFlg: true,
      getPixelFlg: false,
    })
  })
})

describe("updateDisplayContent", () => {
  test("updates pixel_sizes with layout params", async () => {
    reset()
    await updateDisplayContent("ps-1", 600, 800, 10, 20)
    const last = state.calls.at(-1)
    expect(last?.text).toContain("UPDATE pixel_sizes")
    expect(last?.params).toEqual([600, 800, 10, 20, "ps-1"])
  })
})

describe("resetPixelSize", () => {
  test("sets get_pixel_flg to true", async () => {
    reset()
    await resetPixelSize("ps-1")
    const last = state.calls.at(-1)
    expect(last?.text).toContain("get_pixel_flg = true")
    expect(last?.params).toEqual(["ps-1"])
  })
})

describe("createContentsData", () => {
  test("inserts order then content with sequential area_id", async () => {
    reset()
    state.insertReturning = { id: "new-order" }
    state.countRow = { count: "3" }
    await createContentsData("北海道")
    const last = state.calls.at(-1)
    expect(last?.text).toContain("INSERT INTO contents")
    expect(last?.params).toEqual(["3", "北海道", "new-order"])
  })
})

describe("updateContentsData", () => {
  test("updates area_name for given content", async () => {
    reset()
    const contents = [{ orderId: "o1" }, { orderId: "o2" }] as Parameters<
      typeof updateContentsData
    >[1]
    await updateContentsData(0, contents, "東北")
    const last = state.calls.at(-1)
    expect(last?.text).toContain("UPDATE contents")
    expect(last?.text).toContain("area_name")
    expect(last?.params).toEqual(["東北", "o1"])
  })
})

describe("createAccountData", () => {
  test("creates auth user via Better Auth and updates fields", async () => {
    reset()
    state.signUpResult = {
      data: { user: { id: "new-uid" } },
      error: null,
    }
    const user = {
      userName: "テスト",
      management: false,
      coverageArea: ["0"],
      passFlg: true,
    }
    await createAccountData("test@example.com", "pass123", user)
    const last = state.calls.at(-1)
    expect(last?.text).toContain('UPDATE "user"')
    expect(last?.params?.[3]).toBe("new-uid")
  })

  test("throws when sign up fails", async () => {
    reset()
    state.signUpResult = {
      data: null,
      error: { message: "already exists" },
    }
    await expect(
      createAccountData("dup@example.com", "pass", {
        userName: "x",
        management: false,
        coverageArea: [],
      }),
    ).rejects.toThrow("already exists")
  })
})

describe("updateAccountData", () => {
  test("updates user fields", async () => {
    reset()
    const user = {
      userName: "更新",
      management: true,
      coverageArea: ["0", "1"],
    }
    await updateAccountData("uid-1", user, "a@example.com", "", "")
    const last = state.calls.at(-1)
    expect(last?.text).toContain('UPDATE "user"')
    expect(last?.params).toEqual(["更新", true, ["0", "1"], "uid-1"])
  })
})

describe("Property: setContentOrder always targets orders table", () => {
  const docIdArb = fc.uuid()

  test("always upserts to orders table", async () => {
    await fc.assert(
      fc.asyncProperty(docIdArb, async (docId: string) => {
        reset()
        await setContentOrder(docId, {
          set1: [
            { fileName: "a.png", path: "p", type: "image", viewTime: 100 },
          ],
        })
        const last = state.calls.at(-1)
        expect(last?.text).toContain("INSERT INTO orders")
      }),
      { numRuns: 50 },
    )
  })
})
