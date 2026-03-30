import { describe, expect, test } from "bun:test"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

function collectTsFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...collectTsFiles(full))
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      files.push(full)
    }
  }
  return files
}

describe("App Router migration: next/router replaced with next/navigation", () => {
  const appFiles = collectTsFiles(resolve(root, "app"))
  const componentFiles = collectTsFiles(resolve(root, "components"))
  const allFiles = [...appFiles, ...componentFiles]

  test("no files import from next/router", () => {
    const offenders: string[] = []
    for (const file of allFiles) {
      const content = readFileSync(file, "utf-8")
      if (
        content.includes('from "next/router"') ||
        content.includes("from 'next/router'")
      ) {
        offenders.push(file.replace(`${root}/`, ""))
      }
    }
    expect(offenders).toEqual([])
  })

  test("components using useRouter import from next/navigation", () => {
    for (const file of allFiles) {
      const content = readFileSync(file, "utf-8")
      if (content.includes("useRouter")) {
        expect(content).toContain("next/navigation")
      }
    }
  })

  test("components using usePathname import from next/navigation", () => {
    for (const file of allFiles) {
      const content = readFileSync(file, "utf-8")
      if (content.includes("usePathname")) {
        expect(content).toContain("next/navigation")
      }
    }
  })

  test("components using useSearchParams import from next/navigation", () => {
    for (const file of allFiles) {
      const content = readFileSync(file, "utf-8")
      if (content.includes("useSearchParams")) {
        expect(content).toContain("next/navigation")
      }
    }
  })
})
