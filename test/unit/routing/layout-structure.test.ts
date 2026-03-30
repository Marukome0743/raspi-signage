import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dir, "../../..")

describe("App Router migration: layout structure", () => {
  test("root layout renders <html> and <body> tags", () => {
    const content = readFileSync(resolve(root, "app/layout.tsx"), "utf-8")
    expect(content).toContain("<html")
    expect(content).toContain("<body>")
    expect(content).toContain("</body>")
    expect(content).toContain("</html>")
  })

  test("root layout includes Emotion CacheProvider", () => {
    const content = readFileSync(resolve(root, "app/layout.tsx"), "utf-8")
    expect(content).toContain("CacheProvider")
    expect(content).toContain("createEmotionCache")
  })

  test("root layout includes MUI ThemeProvider and CssBaseline", () => {
    const content = readFileSync(resolve(root, "app/layout.tsx"), "utf-8")
    expect(content).toContain("ThemeProvider")
    expect(content).toContain("CssBaseline")
  })

  test("root layout accepts and renders children", () => {
    const content = readFileSync(resolve(root, "app/layout.tsx"), "utf-8")
    expect(content).toContain("{children}")
    expect(content).toMatch(/function\s+RootLayout\s*\(\s*\{\s*children\s*\}/)
  })

  test("dashboard layout wraps children with Dashboard component", () => {
    const content = readFileSync(
      resolve(root, "app/dashboard/layout.tsx"),
      "utf-8",
    )
    expect(content).toContain("Dashboard")
    expect(content).toContain("{children}")
  })

  test("dashboard layout uses OrderProvider via Dashboard", () => {
    const dashboardContent = readFileSync(
      resolve(root, "components/dashboard/Dashboard.tsx"),
      "utf-8",
    )
    expect(dashboardContent).toContain("OrderProvider")
  })
})

describe("App Router migration: Suspense boundaries", () => {
  test("root page wraps useSearchParams in Suspense", () => {
    const content = readFileSync(resolve(root, "app/page.tsx"), "utf-8")
    expect(content).toContain("Suspense")
    expect(content).toContain("useSearchParams")
  })
})
