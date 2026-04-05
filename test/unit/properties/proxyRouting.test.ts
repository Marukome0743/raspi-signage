import { describe, expect, test } from "bun:test"
import * as fc from "fast-check"

import { getRoutingDecision, PUBLIC_PATHS } from "@/proxy"

/**
 * Property 1: Proxy ルーティングの正当性
 *
 * 任意のリクエストパスと認証状態の組み合わせに対して、Proxy は以下のルールに従う:
 * - 公開パスは認証状態に関わらず通過
 * - 保護対象パスかつ未認証ならリダイレクト
 * - 保護対象パスかつ認証済みなら通過
 *
 * **Validates: Requirements 1.1, 1.2, 1.3**
 */
describe("Property 1: Proxy ルーティングの正当性", () => {
  const dashboardSegment = fc.stringMatching(/^[a-z][a-z-]{0,19}$/)

  const protectedDashboardPath = dashboardSegment
    .filter(
      (seg) =>
        seg !== "login" &&
        seg !== "password-reset" &&
        !seg.startsWith("login") &&
        !seg.startsWith("password-reset"),
    )
    .map((seg) => `/dashboard/${seg}`)

  const publicPath = fc.oneof(
    fc.constant("/dashboard/login"),
    fc.constant("/dashboard/password-reset"),
    fc.constant("/dashboard/login/callback"),
    fc.constant("/dashboard/password-reset/confirm"),
  )

  const nonDashboardPath = dashboardSegment.map((seg) => `/${seg}`)

  const authState = fc.boolean()

  test("公開パスは認証状態に関わらず通過する", () => {
    fc.assert(
      fc.property(publicPath, authState, (path, isAuthenticated) => {
        const decision = getRoutingDecision(path, isAuthenticated)
        expect(decision).toEqual({ action: "pass" })
      }),
      { numRuns: 100 },
    )
  })

  test("/dashboard 配下以外のパスは認証状態に関わらず通過する", () => {
    fc.assert(
      fc.property(nonDashboardPath, authState, (path, isAuthenticated) => {
        const decision = getRoutingDecision(path, isAuthenticated)
        expect(decision).toEqual({ action: "pass" })
      }),
      { numRuns: 100 },
    )
  })

  test("保護対象パスかつ未認証ならリダイレクトする", () => {
    fc.assert(
      fc.property(protectedDashboardPath, (path) => {
        const decision = getRoutingDecision(path, false)
        expect(decision).toEqual({
          action: "redirect",
          destination: "/dashboard/login",
        })
      }),
      { numRuns: 100 },
    )
  })

  test("保護対象パスかつ認証済みなら通過する", () => {
    fc.assert(
      fc.property(protectedDashboardPath, (path) => {
        const decision = getRoutingDecision(path, true)
        expect(decision).toEqual({ action: "pass" })
      }),
      { numRuns: 100 },
    )
  })

  test("/dashboard 自体も保護対象パスとして扱われる", () => {
    fc.assert(
      fc.property(authState, (isAuthenticated) => {
        const decision = getRoutingDecision("/dashboard", isAuthenticated)
        if (isAuthenticated) {
          expect(decision).toEqual({ action: "pass" })
        } else {
          expect(decision).toEqual({
            action: "redirect",
            destination: "/dashboard/login",
          })
        }
      }),
      { numRuns: 100 },
    )
  })

  test("PUBLIC_PATHS の各パスは常に通過する", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PUBLIC_PATHS),
        authState,
        (path, isAuthenticated) => {
          const decision = getRoutingDecision(path, isAuthenticated)
          expect(decision).toEqual({ action: "pass" })
        },
      ),
      { numRuns: 100 },
    )
  })
})
