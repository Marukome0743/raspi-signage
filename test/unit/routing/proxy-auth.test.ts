import { describe, expect, test } from "bun:test"

import { getRoutingDecision } from "@/proxy"

/**
 * proxy.ts のユニットテスト
 *
 * 具体的なパスでのリダイレクト/通過を検証
 * Requirements: 1.1, 1.2, 1.3
 */
describe("proxy auth routing", () => {
  describe("未認証ユーザーのリダイレクト (Requirement 1.1)", () => {
    test("/dashboard で未認証ならリダイレクト", () => {
      const decision = getRoutingDecision("/dashboard", false)
      expect(decision).toEqual({
        action: "redirect",
        destination: "/dashboard/login",
      })
    })

    test("/dashboard/manage-contents で未認証ならリダイレクト", () => {
      const decision = getRoutingDecision("/dashboard/manage-contents", false)
      expect(decision).toEqual({
        action: "redirect",
        destination: "/dashboard/login",
      })
    })

    test("/dashboard/area-management で未認証ならリダイレクト", () => {
      const decision = getRoutingDecision("/dashboard/area-management", false)
      expect(decision).toEqual({
        action: "redirect",
        destination: "/dashboard/login",
      })
    })

    test("/dashboard/view-position で未認証ならリダイレクト", () => {
      const decision = getRoutingDecision("/dashboard/view-position", false)
      expect(decision).toEqual({
        action: "redirect",
        destination: "/dashboard/login",
      })
    })
  })

  describe("認証済みユーザーの通過 (Requirement 1.2)", () => {
    test("/dashboard で認証済みなら通過", () => {
      const decision = getRoutingDecision("/dashboard", true)
      expect(decision).toEqual({ action: "pass" })
    })

    test("/dashboard/manage-contents で認証済みなら通過", () => {
      const decision = getRoutingDecision("/dashboard/manage-contents", true)
      expect(decision).toEqual({ action: "pass" })
    })

    test("/dashboard/area-management で認証済みなら通過", () => {
      const decision = getRoutingDecision("/dashboard/area-management", true)
      expect(decision).toEqual({ action: "pass" })
    })
  })

  describe("公開パスの通過 (Requirement 1.3)", () => {
    test("/dashboard/login は未認証でも通過", () => {
      const decision = getRoutingDecision("/dashboard/login", false)
      expect(decision).toEqual({ action: "pass" })
    })

    test("/dashboard/login は認証済みでも通過", () => {
      const decision = getRoutingDecision("/dashboard/login", true)
      expect(decision).toEqual({ action: "pass" })
    })

    test("/dashboard/password-reset は未認証でも通過", () => {
      const decision = getRoutingDecision("/dashboard/password-reset", false)
      expect(decision).toEqual({ action: "pass" })
    })

    test("/dashboard/password-reset は認証済みでも通過", () => {
      const decision = getRoutingDecision("/dashboard/password-reset", true)
      expect(decision).toEqual({ action: "pass" })
    })

    test("/dashboard/login/callback はサブパスも通過", () => {
      const decision = getRoutingDecision("/dashboard/login/callback", false)
      expect(decision).toEqual({ action: "pass" })
    })
  })

  describe("/dashboard 配下以外のパスはスキップ", () => {
    test("/ は通過", () => {
      const decision = getRoutingDecision("/", false)
      expect(decision).toEqual({ action: "pass" })
    })

    test("/about は通過", () => {
      const decision = getRoutingDecision("/about", false)
      expect(decision).toEqual({ action: "pass" })
    })

    test("/api/data は通過", () => {
      const decision = getRoutingDecision("/api/data", false)
      expect(decision).toEqual({ action: "pass" })
    })
  })
})
