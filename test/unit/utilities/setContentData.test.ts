import { describe, expect, mock, test } from "bun:test"
import fc from "fast-check"

interface QueryResult {
  data: Record<string, unknown> | null
  error: { message: string } | null
}

interface CountResult {
  count: number
}

interface AuthResult {
  data: { user: { id: string } | null }
  error: { message: string } | null
}

const state: {
  table: string | null
  operation: string | null
  params: Record<string, unknown> | null
  queryResult: QueryResult
  countResult: CountResult
  authResult: AuthResult
  adminAuthResult: AuthResult
  signInError: { message: string } | null
  updateUserError: { message: string } | null
} = {
  table: null,
  operation: null,
  params: null,
  queryResult: { data: null, error: null },
  countResult: { count: 0 },
  authResult: { data: { user: null }, error: null },
  adminAuthResult: { data: { user: null }, error: null },
  signInError: null,
  updateUserError: null,
}

const createBuilder = () => {
  const builder: unknown = new Proxy(() => {}, {
    get(_target: unknown, prop: string) {
      if (prop === "then") {
        return (resolve: (value: QueryResult) => void) =>
          resolve(state.queryResult)
      }
      if (prop === "insert") {
        return (params: Record<string, unknown>) => {
          state.operation = "insert"
          state.params = params
          return builder
        }
      }
      if (prop === "update") {
        return (params: Record<string, unknown>) => {
          state.operation = "update"
          state.params = params
          return builder
        }
      }
      if (prop === "upsert") {
        return (params: Record<string, unknown>) => {
          state.operation = "upsert"
          state.params = params
          return builder
        }
      }
      if (prop === "select") {
        return (_cols: string, opts?: { head?: boolean }) => {
          if (opts?.head) {
            return Promise.resolve(state.countResult)
          }
          return builder
        }
      }
      if (prop === "single") {
        return () => Promise.resolve(state.queryResult)
      }
      return () => builder
    },
  })
  return builder
}

mock.module("../../../src/supabase/client", () => ({
  createClient: () => ({
    from: (table: string) => {
      state.table = table
      return createBuilder()
    },
    auth: {
      signInWithPassword: () => Promise.resolve({ error: state.signInError }),
      updateUser: () => Promise.resolve({ error: state.updateUserError }),
    },
  }),
}))

mock.module("@/src/supabase/client", () => ({
  createClient: () => ({
    from: (table: string) => {
      state.table = table
      return createBuilder()
    },
    auth: {
      signInWithPassword: () => Promise.resolve({ error: state.signInError }),
      updateUser: () => Promise.resolve({ error: state.updateUserError }),
    },
  }),
}))

mock.module("../../../src/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      state.table = table
      return createBuilder()
    },
    auth: {
      admin: {
        createUser: () => Promise.resolve(state.adminAuthResult),
      },
    },
  }),
}))

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

describe("setContentOrder", () => {
  test("upserts to orders table", async () => {
    const docId = "order-1"
    const content = { set1: [{ fileName: "test.png" }] }
    await setContentOrder(docId, content)
    expect(state.table).toBe("orders")
    expect(state.operation).toBe("upsert")
    expect(state.params).toEqual({ id: docId, ...content })
  })
})

describe("updateContentOrder", () => {
  test("updates orders table with eq filter", async () => {
    await updateContentOrder("order-1", { hidden: [] })
    expect(state.table).toBe("orders")
    expect(state.operation).toBe("update")
    expect(state.params).toEqual({ hidden: [] })
  })
})

describe("deleteContentsData", () => {
  test("soft-deletes content by setting deleted=true", async () => {
    const contents = [{ orderId: "o1" }, { orderId: "o2" }] as {
      orderId: string
    }[]
    await deleteContentsData(
      1,
      contents as Parameters<typeof deleteContentsData>[1],
    )
    expect(state.table).toBe("contents")
    expect(state.operation).toBe("update")
    expect(state.params).toEqual({ deleted: true })
  })
})

describe("deleteAccountData", () => {
  test("soft-deletes user by setting deleted=true", async () => {
    await deleteAccountData("uid-1")
    expect(state.table).toBe("users")
    expect(state.operation).toBe("update")
    expect(state.params).toEqual({ deleted: true })
  })
})

describe("setContentPixelSize", () => {
  test("creates new pixel_size when pixelSizeId is empty", async () => {
    state.queryResult = { data: { id: "new-ps" }, error: null }
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
    state.queryResult = {
      data: {
        width: 800,
        height: 600,
        pixel_width: 800,
        pixel_height: 600,
        margin_top: 10,
        margin_left: 20,
        display_content_flg: true,
        get_pixel_flg: false,
      },
      error: null,
    }
    const result = await setContentPixelSize("order-1", "ps-1", 1920, 1080)
    expect(result?.pixelWidth).toBe(800)
    expect(result?.marginTop).toBe(10)
  })

  test("returns null when pixel_size not found", async () => {
    state.queryResult = { data: null, error: null }
    const result = await setContentPixelSize("order-1", "bad-id", 1920, 1080)
    expect(result).toBeNull()
  })
})

describe("createDisplayContent", () => {
  test("inserts pixel_size and returns merged result", async () => {
    state.queryResult = { data: { id: "new-ps" }, error: null }
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
    await updateDisplayContent("ps-1", 600, 800, 10, 20)
    expect(state.table).toBe("pixel_sizes")
    expect(state.operation).toBe("update")
    expect(state.params).toEqual({
      height: 600,
      width: 800,
      margin_top: 10,
      margin_left: 20,
    })
  })
})

describe("resetPixelSize", () => {
  test("sets get_pixel_flg to true", async () => {
    await resetPixelSize("ps-1")
    expect(state.table).toBe("pixel_sizes")
    expect(state.operation).toBe("update")
    expect(state.params).toEqual({ get_pixel_flg: true })
  })
})

describe("createContentsData", () => {
  test("inserts order then content", async () => {
    state.queryResult = { data: { id: "new-order" }, error: null }
    state.countResult = { count: 3 }
    await createContentsData("北海道")
    expect(state.table).toBe("contents")
    expect(state.operation).toBe("insert")
    expect(state.params).toEqual({
      area_name: "北海道",
      order_id: "new-order",
      area_id: "3",
      deleted: false,
    })
  })
})

describe("updateContentsData", () => {
  test("updates area_name for given content", async () => {
    const contents = [{ orderId: "o1" }, { orderId: "o2" }] as {
      orderId: string
    }[]
    await updateContentsData(
      0,
      contents as Parameters<typeof updateContentsData>[1],
      "東北",
    )
    expect(state.table).toBe("contents")
    expect(state.operation).toBe("update")
    expect(state.params).toEqual({ area_name: "東北" })
  })
})

describe("createAccountData", () => {
  test("creates auth user and inserts user record", async () => {
    state.adminAuthResult = {
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
    expect(state.table).toBe("users")
    expect(state.operation).toBe("insert")
    expect(state.params?.id).toBe("new-uid")
    expect(state.params?.user_name).toBe("テスト")
  })

  test("throws when auth fails", async () => {
    state.adminAuthResult = {
      data: { user: null },
      error: { message: "already exists" },
    }
    state.table = null
    state.operation = null
    expect(
      createAccountData(
        "dup@example.com",
        "pass",
        {} as Parameters<typeof createAccountData>[2],
      ),
    ).rejects.toThrow("already exists")
  })
})

describe("updateAccountData", () => {
  test("updates user without password change", async () => {
    const user = {
      userName: "更新",
      management: true,
      coverageArea: ["0", "1"],
    }
    await updateAccountData("uid-1", user, "a@example.com", "", "")
    expect(state.table).toBe("users")
    expect(state.operation).toBe("update")
    expect(state.params).toEqual({
      user_name: "更新",
      management: true,
      coverage_area: ["0", "1"],
    })
  })

  test("updates password then user when newPassword provided", async () => {
    state.signInError = null
    state.updateUserError = null
    const user = { userName: "更新", management: false, coverageArea: ["0"] }
    await updateAccountData("uid-1", user, "a@example.com", "old", "new")
    expect(state.table).toBe("users")
    expect(state.params).toEqual({
      user_name: "更新",
      management: false,
      coverage_area: ["0"],
    })
  })

  test("throws when signIn fails", async () => {
    state.signInError = { message: "bad password" }
    state.table = null
    state.operation = null
    const user = {
      userName: "x",
      management: false,
      coverageArea: [] as string[],
    }
    expect(
      updateAccountData("uid-1", user, "a@example.com", "wrong", "new"),
    ).rejects.toThrow("bad password")
  })

  test("throws when updateUser fails", async () => {
    state.signInError = null
    state.updateUserError = { message: "update failed" }
    state.table = null
    state.operation = null
    const user = {
      userName: "x",
      management: false,
      coverageArea: [] as string[],
    }
    expect(
      updateAccountData("uid-1", user, "a@example.com", "old", "new"),
    ).rejects.toThrow("update failed")
  })
})

describe("Property: setContentOrder always targets orders table", () => {
  const docIdArb = fc.uuid()
  const contentArb = fc.record({
    set1: fc.array(fc.record({ fileName: fc.string() })),
  })

  test("always upserts to orders table", async () => {
    await fc.assert(
      fc.asyncProperty(
        docIdArb,
        contentArb,
        async (docId: string, content: { set1: { fileName: string }[] }) => {
          await setContentOrder(docId, content)
          expect(state.table).toBe("orders")
          expect(state.operation).toBe("upsert")
        },
      ),
      { numRuns: 50 },
    )
  })
})
