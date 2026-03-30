import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

describe("App Router migration: dashboard route parity", () => {
  const routes: { path: string; page: string }[] = [
    { path: "/dashboard", page: "app/dashboard/page.tsx" },
    { path: "/dashboard/Login", page: "app/dashboard/Login/page.tsx" },
    {
      path: "/dashboard/PasswordReset",
      page: "app/dashboard/PasswordReset/page.tsx",
    },
    {
      path: "/dashboard/ManageContents",
      page: "app/dashboard/ManageContents/page.tsx",
    },
    {
      path: "/dashboard/AccountSettingManagement",
      page: "app/dashboard/AccountSettingManagement/page.tsx",
    },
    {
      path: "/dashboard/AreaManagement",
      page: "app/dashboard/AreaManagement/page.tsx",
    },
    {
      path: "/dashboard/UserAccountManagement",
      page: "app/dashboard/UserAccountManagement/page.tsx",
    },
    {
      path: "/dashboard/ViewPosition",
      page: "app/dashboard/ViewPosition/page.tsx",
    },
  ]

  test("all dashboard routes export a default function component", () => {
    for (const { page } of routes) {
      const content = readFileSync(resolve(root, page), "utf-8")
      expect(content).toMatch(/export\s+default\s+function\s+\w+/)
    }
  })

  test("navigation links in ListItems match App Router paths", () => {
    const content = readFileSync(
      resolve(root, "components/dashboard/ListItems.tsx"),
      "utf-8",
    )
    const expectedPaths = [
      "/dashboard",
      "/dashboard/ManageContents",
      "/dashboard/ViewPosition",
      "/dashboard/AreaManagement",
      "/dashboard/UserAccountManagement",
      "/dashboard/AccountSettingManagement",
    ]
    for (const path of expectedPaths) {
      expect(content).toContain(`"${path}"`)
    }
  })

  test("login redirects in components use App Router paths", () => {
    const files: string[] = [
      "components/dashboard/LoginComponent.tsx",
      "components/dashboard/PasswordResetComponent.tsx",
    ]
    for (const file of files) {
      const content = readFileSync(resolve(root, file), "utf-8")
      // Should use /dashboard/Login or /dashboard/PasswordReset paths
      if (content.includes("router.push")) {
        expect(content).toMatch(/router\.push\(["']\/dashboard/)
      }
    }
  })

  test("Dashboard component uses usePathname for route detection", () => {
    const content = readFileSync(
      resolve(root, "components/dashboard/Dashboard.tsx"),
      "utf-8",
    )
    expect(content).toContain("usePathname")
    expect(content).toContain("AREA_DISPLAY_PATHS")
    expect(content).toContain("PASS_PATHS")
  })
})
