import { describe, expect, test } from "bun:test"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import * as fc from "fast-check"

/** Recursively collect all .ts/.tsx files under given directories */
function collectTsFiles(dirs: string[]): string[] {
  const files: string[] = []
  const projectRoot = resolve(".")

  function walk(dir: string): void {
    const fullDir = resolve(projectRoot, dir)
    if (!existsSync(fullDir)) {
      return
    }
    for (const entry of readdirSync(fullDir)) {
      const fullPath = join(fullDir, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        walk(join(dir, entry))
      } else if (/\.(ts|tsx)$/.test(entry)) {
        files.push(join(dir, entry))
      }
    }
  }

  for (const dir of dirs) {
    walk(dir)
  }
  return files
}

/** Extract relative import paths from a TypeScript file */
function extractRelativeImports(filePath: string): string[] {
  const content = readFileSync(resolve(filePath), "utf-8")
  const importRegex = /(?:import|export)\s+.*?from\s+["'](\.\.?\/[^"']+)["']/g
  const paths: string[] = []
  let match: RegExpExecArray | null = importRegex.exec(content)
  while (match !== null) {
    paths.push(match[1])
    match = importRegex.exec(content)
  }
  return paths
}

/** Check if an import path resolves to an existing file */
function resolveImportPath(importPath: string, fromFile: string): boolean {
  const dir = dirname(resolve(fromFile))
  const base = resolve(dir, importPath)

  // Try exact path first
  if (existsSync(base) && statSync(base).isFile()) {
    return true
  }

  // Try with extensions
  const extensions = [".ts", ".tsx", ".js", ".jsx", ".json", ".css"]
  for (const ext of extensions) {
    if (existsSync(base + ext)) {
      return true
    }
  }

  // Try as directory with index file
  const indexExtensions = [".ts", ".tsx", ".js", ".jsx"]
  for (const ext of indexExtensions) {
    if (existsSync(join(base, `index${ext}`))) {
      return true
    }
  }

  return false
}

/** Check if an import path references an old .js file */
function referencesJsFile(importPath: string): boolean {
  return /\.js$/.test(importPath)
}

const TARGET_DIRS = ["app", "components", "src", "utilities"]
const allTsFiles = collectTsFiles(TARGET_DIRS)

describe("Property 4: Import path integrity", () => {
  test("collects all TypeScript files", () => {
    expect(allTsFiles.length).toBeGreaterThan(0)
  })

  test("all relative imports in TypeScript files resolve to valid paths", () => {
    // Use fast-check to randomly sample files and verify import integrity
    const fileArb = fc.integer({ min: 0, max: allTsFiles.length - 1 })

    fc.assert(
      fc.property(fileArb, (index) => {
        const filePath = allTsFiles[index]
        const imports = extractRelativeImports(filePath)

        for (const importPath of imports) {
          const resolved = resolveImportPath(importPath, filePath)
          expect(resolved).toBe(true)
        }
      }),
      { numRuns: Math.max(100, allTsFiles.length * 3) },
    )
  })

  test("no relative imports reference old .js files", () => {
    const fileArb = fc.integer({ min: 0, max: allTsFiles.length - 1 })

    fc.assert(
      fc.property(fileArb, (index) => {
        const filePath = allTsFiles[index]
        const imports = extractRelativeImports(filePath)

        for (const importPath of imports) {
          expect(referencesJsFile(importPath)).toBe(false)
        }
      }),
      { numRuns: Math.max(100, allTsFiles.length * 3) },
    )
  })
})
