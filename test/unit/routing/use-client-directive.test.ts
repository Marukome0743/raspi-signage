import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

describe("App Router migration: 'use client' directives", () => {
  const clientPages: string[] = [
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

  for (const page of clientPages) {
    test(`${page} has "use client" directive`, () => {
      const content = readFileSync(resolve(root, page), "utf-8")
      expect(content.trimStart().startsWith('"use client"')).toBe(true)
    })
  }
})
