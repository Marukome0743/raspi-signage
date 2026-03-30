import { describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

describe("App Router migration: file structure", () => {
  const appRouterPages: string[] = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/dashboard/layout.tsx",
    "app/dashboard/page.tsx",
    "app/dashboard/Login/page.tsx",
    "app/dashboard/PasswordReset/page.tsx",
    "app/dashboard/ManageContents/page.tsx",
    "app/dashboard/AccountSettingManagement/page.tsx",
    "app/dashboard/AreaManagement/page.tsx",
    "app/dashboard/UserAccountManagement/page.tsx",
    "app/dashboard/ViewPosition/page.tsx",
  ]

  for (const page of appRouterPages) {
    test(`${page} exists`, () => {
      expect(existsSync(resolve(root, page))).toBe(true)
    })
  }

  const deletedPagesRouterFiles = [
    "pages/_app.js",
    "pages/_document.js",
    "pages/index.js",
    "pages/dashboard/index.js",
    "pages/dashboard/Login.js",
    "pages/dashboard/PasswordReset.js",
    "pages/dashboard/ManageContents.js",
    "pages/dashboard/AccountSettingManagement.js",
    "pages/dashboard/AreaManagement.js",
    "pages/dashboard/UserAccountManagement.js",
    "pages/dashboard/ViewPosition.js",
  ]

  for (const page of deletedPagesRouterFiles) {
    test(`old ${page} has been removed`, () => {
      expect(existsSync(resolve(root, page))).toBe(false)
    })
  }
})
