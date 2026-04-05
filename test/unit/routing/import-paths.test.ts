import { describe, expect, test } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

describe("App Router migration: import paths resolve correctly", () => {
  // After inlining, page files import shared components directly
  const pageSharedImports: { page: string; expectedImports: string[] }[] = [
    {
      page: "app/dashboard/login/page.tsx",
      expectedImports: [
        "@/components/dashboard/ErrorDialog",
        "@/components/dashboard/OrderContext",
      ],
    },
    {
      page: "app/dashboard/password-reset/page.tsx",
      expectedImports: [
        "@/components/dashboard/ErrorDialog",
        "@/components/dashboard/OrderContext",
      ],
    },
    {
      page: "app/dashboard/manage-contents/page.tsx",
      expectedImports: ["@/components/dashboard/ManageContentsClient"],
    },
    {
      page: "app/dashboard/account-setting-management/page.tsx",
      expectedImports: [
        "@/components/dashboard/AccountSettingManagementClient",
      ],
    },
    {
      page: "app/dashboard/area-management/page.tsx",
      expectedImports: ["@/components/dashboard/AreaManagementClient"],
    },
    {
      page: "app/dashboard/user-account-management/page.tsx",
      expectedImports: ["@/components/dashboard/UserAccountManagementClient"],
    },
    {
      page: "app/dashboard/view-position/page.tsx",
      expectedImports: ["@/components/dashboard/ViewPositionClient"],
    },
    {
      page: "app/dashboard/layout.tsx",
      expectedImports: ["@/components/dashboard/Dashboard"],
    },
    {
      page: "app/dashboard/page.tsx",
      expectedImports: ["@/components/dashboard/DashboardUploadClient"],
    },
  ]

  for (const { page, expectedImports } of pageSharedImports) {
    test(`${page} imports shared components from correct path`, () => {
      const content = readFileSync(resolve(root, page), "utf-8")
      for (const expectedImport of expectedImports) {
        expect(content).toContain(expectedImport)
      }
    })
  }

  test("shared component files exist", () => {
    const components = [
      "components/dashboard/Dashboard.tsx",
      "components/dashboard/ErrorDialog.tsx",
      "components/dashboard/OrderContext.tsx",
    ]
    for (const component of components) {
      expect(existsSync(resolve(root, component))).toBe(true)
    }
  })

  test("inlined component files no longer exist", () => {
    const deletedComponents = [
      "components/dashboard/LoginComponent.tsx",
      "components/dashboard/PasswordResetComponent.tsx",
      "components/dashboard/ManageContentsList.tsx",
      "components/dashboard/AccountSettingManagementComponent.tsx",
      "components/dashboard/AreaManagementComponent.tsx",
      "components/dashboard/UserAccountManagementComponent.tsx",
      "components/dashboard/ViewPositionComponent.tsx",
      "components/dashboard/UploadContents.tsx",
      "components/dashboard/ListItems.tsx",
      "components/dashboard/styles.ts",
      "components/dashboard/CustomizedSnackbars.tsx",
      "components/dashboard/Title.tsx",
    ]
    for (const component of deletedComponents) {
      expect(existsSync(resolve(root, component))).toBe(false)
    }
  })
})
