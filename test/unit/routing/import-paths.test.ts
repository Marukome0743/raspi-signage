import { describe, expect, test } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

describe("App Router migration: import paths resolve correctly", () => {
  const pageImports: { page: string; expectedImport: string }[] = [
    {
      page: "app/dashboard/Login/page.tsx",
      expectedImport: "@/components/dashboard/LoginComponent",
    },
    {
      page: "app/dashboard/password-reset/page.tsx",
      expectedImport: "@/components/dashboard/PasswordResetComponent",
    },
    {
      page: "app/dashboard/manage-contents/page.tsx",
      expectedImport: "@/components/dashboard/ManageContentsList",
    },
    {
      page: "app/dashboard/account-setting-management/page.tsx",
      expectedImport:
        "@/components/dashboard/AccountSettingManagementComponent",
    },
    {
      page: "app/dashboard/area-management/page.tsx",
      expectedImport: "@/components/dashboard/AreaManagementComponent",
    },
    {
      page: "app/dashboard/user-account-management/page.tsx",
      expectedImport: "@/components/dashboard/UserAccountManagementComponent",
    },
    {
      page: "app/dashboard/view-position/page.tsx",
      expectedImport: "@/components/dashboard/ViewPositionComponent",
    },
    {
      page: "app/dashboard/layout.tsx",
      expectedImport: "@/components/dashboard/Dashboard",
    },
    {
      page: "app/dashboard/page.tsx",
      expectedImport: "@/components/dashboard/UploadContents",
    },
  ]

  for (const { page, expectedImport } of pageImports) {
    test(`${page} imports from correct path`, () => {
      const content = readFileSync(resolve(root, page), "utf-8")
      expect(content).toContain(expectedImport)
    })
  }

  test("all component files exist", () => {
    const components = [
      "components/dashboard/LoginComponent.tsx",
      "components/dashboard/PasswordResetComponent.tsx",
      "components/dashboard/ManageContentsList.tsx",
      "components/dashboard/AccountSettingManagementComponent.tsx",
      "components/dashboard/AreaManagementComponent.tsx",
      "components/dashboard/UserAccountManagementComponent.tsx",
      "components/dashboard/ViewPositionComponent.tsx",
      "components/dashboard/Dashboard.tsx",
      "components/dashboard/UploadContents.tsx",
    ]
    for (const component of components) {
      expect(existsSync(resolve(root, component))).toBe(true)
    }
  })
})
