import type { User } from "@supabase/supabase-js"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/src/supabase/client"
import type { OrderContextValue } from "@/src/supabase/database.types"

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
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined,
  )
  const [uid, setUid] = useState<string | undefined>(undefined)
  const [userName, setUserName] = useState<string | undefined>(undefined)
  const [coverageArea, setCoverageArea] = useState<string[]>([])
  const [progress, setProgress] = useState<boolean>(false)

  const router = useRouter()
  const pathname = usePathname()
  const isAvailableForViewing = pathname === "/dashboard/login"

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      const user = session?.user ?? null
      setCurrentUser(user)
      if (!user && !isAvailableForViewing) {
        router.push("/dashboard/login")
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [isAvailableForViewing, router])

  return (
    <OrderContext.Provider
      value={{
        orderId,
        setOrderId,
        isAdmin,
        setIsAdmin,
        currentUser,
        uid,
        setUid,
        userName,
        setUserName,
        coverageArea,
        setCoverageArea,
        progress,
        setProgress,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}
