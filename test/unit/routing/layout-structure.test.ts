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

  test("root layout uses AppRouterCacheProvider, ColorModeProvider, and CssBaseline", () => {
    const content = readFileSync(resolve(root, "app/layout.tsx"), "utf-8")
    expect(content).toContain("AppRouterCacheProvider")
    expect(content).toContain("ColorModeProvider")
    expect(content).toContain("CssBaseline")

    const colorModeContent = readFileSync(
      resolve(root, "src/ColorModeContext.tsx"),
      "utf-8",
    )
    expect(colorModeContent).toContain("ThemeProvider")
  })

  test("root layout is a server component (no 'use client')", () => {
    const content = readFileSync(resolve(root, "app/layout.tsx"), "utf-8")
    expect(content).not.toContain('"use client"')
  })

  test("root layout accepts and renders children", () => {
    const content = readFileSync(resolve(root, "app/layout.tsx"), "utf-8")
    expect(content).toContain("{children}")
    expect(content).toContain("RootLayout")
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
  test("root page is a server component that delegates to SignageClient", () => {
    const content = readFileSync(resolve(root, "app/page.tsx"), "utf-8")
    expect(content).toContain("SignageClient")
    expect(content).toContain("searchParams")
  })
})
