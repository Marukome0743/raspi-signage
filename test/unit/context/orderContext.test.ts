import { describe, expect, test } from "bun:test"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import {
  OrderProvider,
  useOrderContext,
} from "@/components/dashboard/OrderContext"
import type { OrderContextValue } from "@/src/db/types"

describe("OrderContext minimal responsibility", () => {
  test("context value contains only orderId, setOrderId, progress, setProgress (Requirement 4.1, 4.5)", () => {
    let capturedContext: OrderContextValue | null = null

    function TestConsumer() {
      capturedContext = useOrderContext()
      return createElement("div", null, "test")
    }

    renderToString(
      createElement(OrderProvider, null, createElement(TestConsumer)),
    )

    expect(capturedContext).not.toBeNull()
    const keys = Object.keys(
      capturedContext as unknown as OrderContextValue,
    ).sort()
    expect(keys).toEqual(["orderId", "progress", "setOrderId", "setProgress"])
  })

  test("orderId initial value is null (Requirement 4.1)", () => {
    let capturedContext: OrderContextValue | null = null

    function TestConsumer() {
      capturedContext = useOrderContext()
      return createElement("div", null, "test")
    }

    renderToString(
      createElement(OrderProvider, null, createElement(TestConsumer)),
    )

    expect(capturedContext).not.toBeNull()
    expect((capturedContext as unknown as OrderContextValue).orderId).toBeNull()
  })

  test("progress initial value is false (Requirement 4.1)", () => {
    let capturedContext: OrderContextValue | null = null

    function TestConsumer() {
      capturedContext = useOrderContext()
      return createElement("div", null, "test")
    }

    renderToString(
      createElement(OrderProvider, null, createElement(TestConsumer)),
    )

    expect(capturedContext).not.toBeNull()
    expect((capturedContext as unknown as OrderContextValue).progress).toBe(
      false,
    )
  })

  test("user info fields are not included in context (Requirement 4.2)", () => {
    let capturedContext: OrderContextValue | null = null

    function TestConsumer() {
      capturedContext = useOrderContext()
      return createElement("div", null, "test")
    }

    renderToString(
      createElement(OrderProvider, null, createElement(TestConsumer)),
    )

    expect(capturedContext).not.toBeNull()
    const ctx = capturedContext as unknown as Record<string, unknown>
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

  test("useOrderContext throws when used outside OrderProvider", () => {
    function TestConsumer() {
      useOrderContext()
      return createElement("div", null, "test")
    }

    expect(() => {
      renderToString(createElement(TestConsumer))
    }).toThrow("useOrderContext must be used within an OrderProvider")
  })
})
