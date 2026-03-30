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

describe("App Router migration: SSR safety", () => {
  const componentFiles = collectTsFiles(resolve(root, "components"))

  test("no top-level window access outside useEffect in components", () => {
    const offenders: { file: string; line: number; content: string }[] = []
    for (const file of componentFiles) {
      const content = readFileSync(file, "utf-8")
      const lines = content.split("\n")
      let inUseEffect = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.includes("useEffect")) {
          inUseEffect++
        }

        // Track brace depth roughly for useEffect blocks
        if (inUseEffect > 0) {
          const opens = (line.match(/\{/g) || []).length
          const closes = (line.match(/\}/g) || []).length
          inUseEffect += opens - closes
          if (inUseEffect <= 0) {
            inUseEffect = 0
          }
          continue
        }

        // Check for bare window access outside useEffect
        if (
          /\bwindow\b/.test(line) &&
          !line.trim().startsWith("//") &&
          !line.trim().startsWith("*") &&
          !line.includes("typeof window")
        ) {
          offenders.push({
            file: file.replace(`${root}/`, ""),
            line: i + 1,
            content: line.trim(),
          })
        }
      }
    }
    expect(offenders).toEqual([])
  })

  test("no top-level document access outside useEffect in components", () => {
    const offenders: { file: string; line: number; content: string }[] = []
    for (const file of componentFiles) {
      const content = readFileSync(file, "utf-8")
      const lines = content.split("\n")
      let inUseEffect = 0

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.includes("useEffect")) {
          inUseEffect++
        }

        if (inUseEffect > 0) {
          const opens = (line.match(/\{/g) || []).length
          const closes = (line.match(/\}/g) || []).length
          inUseEffect += opens - closes
          if (inUseEffect <= 0) {
            inUseEffect = 0
          }
          continue
        }

        if (
          /\bdocument\b/.test(line) &&
          !line.trim().startsWith("//") &&
          !line.trim().startsWith("*") &&
          !line.includes("typeof document") &&
          !line.includes("next/document")
        ) {
          offenders.push({
            file: file.replace(`${root}/`, ""),
            line: i + 1,
            content: line.trim(),
          })
        }
      }
    }
    expect(offenders).toEqual([])
  })
})
