import { useRouter } from "next/router"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../../src/supabase/client"

const OrderContext = createContext({
  currentUser: undefined,
})

export function useOrderContext() {
  return useContext(OrderContext)
}

export function OrderProvider({ children }) {
  const [orderId, setOrderId] = useState()
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState(undefined)
  const [uid, setUid] = useState(undefined)
  const [userName, setUserName] = useState()
  const [coverageArea, setCoverageArea] = useState([])
  const [progress, setProgress] = useState(false)

  const router = useRouter()
  const isAvailableForViewing = router.pathname === "/dashboard/Login"

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setCurrentUser(user)
      if (!user && !isAvailableForViewing) {
        router.push("/dashboard/Login")
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
