import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

describe("App Router migration: 'use client' directives", () => {
  // Pages that need "use client" (contain hooks or browser APIs directly)
  const clientPages: string[] = [
    "app/dashboard/layout.tsx",
    "app/dashboard/page.tsx",
    "app/dashboard/login/page.tsx",
    "app/dashboard/password-reset/page.tsx",
    "app/dashboard/manage-contents/page.tsx",
    "app/dashboard/account-setting-management/page.tsx",
    "app/dashboard/area-management/page.tsx",
    "app/dashboard/user-account-management/page.tsx",
    "app/dashboard/view-position/page.tsx",
  ]

  for (const page of clientPages) {
    test(`${page} has "use client" directive`, () => {
      const content = readFileSync(resolve(root, page), "utf-8")
      expect(content.trimStart().startsWith('"use client"')).toBe(true)
    })
  }

  // Server component pages (no "use client" needed)
  const serverPages: string[] = ["app/layout.tsx", "app/page.tsx"]

  for (const page of serverPages) {
    test(`${page} does not have "use client" directive (server component)`, () => {
      const content = readFileSync(resolve(root, page), "utf-8")
      expect(content.trimStart().startsWith('"use client"')).toBe(false)
    })
  }
})
