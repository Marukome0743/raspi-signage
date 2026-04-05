import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import {
  OrderProvider,
  useOrderContext,
} from "@/components/dashboard/OrderContext"
import type { OrderContextValue } from "@/src/supabase/database.types"

/**
 * OrderContext のユニットテスト
 *
 * リファクタリング後のコンテキスト値が orderId と progress のみであることを検証
 * Requirements: 4.1, 4.5
 */
describe("OrderContext 責務最小化", () => {
  test("コンテキスト値は orderId, setOrderId, progress, setProgress のみを含む (Requirement 4.1, 4.5)", () => {
    let capturedContext: OrderContextValue | null = null

    function TestConsumer() {
      capturedContext = useOrderContext()
      return createElement("div", null, "test")
    }

    renderToString(
      createElement(OrderProvider, null, createElement(TestConsumer)),
    )

    expect(capturedContext).not.toBeNull()
    const keys = Object.keys(capturedContext as OrderContextValue).sort()
    expect(keys).toEqual(["orderId", "progress", "setOrderId", "setProgress"])
  })

  test("orderId の初期値は null (Requirement 4.1)", () => {
    let capturedContext: OrderContextValue | null = null

    function TestConsumer() {
      capturedContext = useOrderContext()
      return createElement("div", null, "test")
    }

    renderToString(
      createElement(OrderProvider, null, createElement(TestConsumer)),
    )

    expect(capturedContext).not.toBeNull()
    expect((capturedContext as OrderContextValue).orderId).toBeNull()
  })

  test("progress の初期値は false (Requirement 4.1)", () => {
    let capturedContext: OrderContextValue | null = null

    function TestConsumer() {
      capturedContext = useOrderContext()
      return createElement("div", null, "test")
    }

    renderToString(
      createElement(OrderProvider, null, createElement(TestConsumer)),
    )

    expect(capturedContext).not.toBeNull()
    expect((capturedContext as OrderContextValue).progress).toBe(false)
  })

  test("ユーザー情報フィールドがコンテキストに含まれない (Requirement 4.2)", () => {
    let capturedContext: OrderContextValue | null = null

    function TestConsumer() {
      capturedContext = useOrderContext()
      return createElement("div", null, "test")
    }

    renderToString(
      createElement(OrderProvider, null, createElement(TestConsumer)),
    )

    expect(capturedContext).not.toBeNull()
    const ctx = capturedContext as Record<string, unknown>
    expect(ctx).not.toHaveProperty("currentUser")
    expect(ctx).not.toHaveProperty("uid")
    expect(ctx).not.toHaveProperty("userName")
    expect(ctx).not.toHaveProperty("isAdmin")
    expect(ctx).not.toHaveProperty("coverageArea")
    expect(ctx).not.toHaveProperty("setUid")
    expect(ctx).not.toHaveProperty("setUserName")
    expect(ctx).not.toHaveProperty("setIsAdmin")
    expect(ctx).not.toHaveProperty("setCoverageArea")
  })

  test("OrderProvider 外で useOrderContext を使うとエラーになる", () => {
    function TestConsumer() {
      useOrderContext()
      return createElement("div", null, "test")
    }

    expect(() => {
      renderToString(createElement(TestConsumer))
    }).toThrow("useOrderContext must be used within an OrderProvider")
  })
})
