// Feature: codebase-refactoring, Property 7: middlewareの静的ファイル除外
import { describe, expect, test } from "bun:test"
import * as fc from "fast-check"

// The matcher pattern from proxy.ts
const matcherPattern =
  /^\/((?!_next\/static|_next\/image|favicon\.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)$/

describe("Property 7: middlewareの静的ファイル除外", () => {
  const staticPaths = [
    fc.constant("/_next/static/chunk.js"),
    fc.constant("/_next/static/css/style.css"),
    fc.constant("/_next/image/photo.jpg"),
    fc.constant("/favicon.ico"),
    fc
      .string({ minLength: 1, maxLength: 20 })
      .map((s) => `/${s.replace(/[/\\]/g, "")}.svg`),
    fc
      .string({ minLength: 1, maxLength: 20 })
      .map((s) => `/${s.replace(/[/\\]/g, "")}.png`),
    fc
      .string({ minLength: 1, maxLength: 20 })
      .map((s) => `/${s.replace(/[/\\]/g, "")}.jpg`),
    fc
      .string({ minLength: 1, maxLength: 20 })
      .map((s) => `/${s.replace(/[/\\]/g, "")}.jpeg`),
    fc
      .string({ minLength: 1, maxLength: 20 })
      .map((s) => `/${s.replace(/[/\\]/g, "")}.gif`),
    fc
      .string({ minLength: 1, maxLength: 20 })
      .map((s) => `/${s.replace(/[/\\]/g, "")}.webp`),
  ]

  test("static file paths do not match the middleware matcher", () => {
    fc.assert(
      fc.property(fc.oneof(...staticPaths), (path) => {
        expect(matcherPattern.test(path)).toBe(false)
      }),
      { numRuns: 100 },
    )
  })

  test("dashboard paths match the middleware matcher", () => {
    const dashboardPaths = fc.oneof(
      fc.constant("/dashboard"),
      fc.constant("/dashboard/login"),
      fc.constant("/dashboard/manage-contents"),
      fc.constant("/dashboard/view-position"),
    )

    fc.assert(
      fc.property(dashboardPaths, (path) => {
        expect(matcherPattern.test(path)).toBe(true)
      }),
      { numRuns: 100 },
    )
  })
})
