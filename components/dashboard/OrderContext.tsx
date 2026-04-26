"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { OrderContextValue } from "@/src/db/types"

const OrderContext = createContext<OrderContextValue | undefined>(undefined)

export function useOrderContext(): OrderContextValue {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrderContext must be used within an OrderProvider")
  }
  return context
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orderId, setOrderId] = useState<string | null>(null)
  const [progress, setProgress] = useState<boolean>(false)

  return (
    <OrderContext.Provider
      value={{
        orderId,
        setOrderId,
        progress,
        setProgress,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
