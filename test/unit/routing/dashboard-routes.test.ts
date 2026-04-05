import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

describe("App Router migration: dashboard route parity", () => {
  const routes: { path: string; page: string }[] = [
    { path: "/dashboard", page: "app/dashboard/page.tsx" },
    { path: "/dashboard/login", page: "app/dashboard/login/page.tsx" },
    {
      path: "/dashboard/password-reset",
      page: "app/dashboard/password-reset/page.tsx",
    },
    {
      path: "/dashboard/manage-contents",
      page: "app/dashboard/manage-contents/page.tsx",
    },
    {
      path: "/dashboard/account-setting-management",
      page: "app/dashboard/account-setting-management/page.tsx",
    },
    {
      path: "/dashboard/area-management",
      page: "app/dashboard/area-management/page.tsx",
    },
    {
      path: "/dashboard/user-account-management",
      page: "app/dashboard/user-account-management/page.tsx",
    },
    {
      path: "/dashboard/view-position",
      page: "app/dashboard/view-position/page.tsx",
    },
  ]

  test("all dashboard routes export a default function component", () => {
    for (const { page } of routes) {
      const content = readFileSync(resolve(root, page), "utf-8")
      expect(content).toMatch(/export\s+default\s+function\s+\w+/)
    }
  })

  test("navigation links in Dashboard match App Router paths", () => {
    const content = readFileSync(
      resolve(root, "components/dashboard/Dashboard.tsx"),
      "utf-8",
    )
    const expectedPaths = [
      "/dashboard",
      "/dashboard/manage-contents",
      "/dashboard/view-position",
      "/dashboard/area-management",
      "/dashboard/user-account-management",
      "/dashboard/account-setting-management",
    ]
    for (const path of expectedPaths) {
      expect(content).toContain(`"${path}"`)
    }
  })

  test("login redirects in pages use App Router paths", () => {
    const files: string[] = [
      "app/dashboard/login/page.tsx",
      "app/dashboard/password-reset/page.tsx",
    ]
    for (const file of files) {
      const content = readFileSync(resolve(root, file), "utf-8")
      // Should use /dashboard/login or /dashboard/password-reset paths
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
