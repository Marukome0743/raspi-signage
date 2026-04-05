import Dashboard from "@/components/dashboard/Dashboard"
import type { UserInfo } from "@/src/supabase/database.types"
import { createClient } from "@/src/supabase/server"

async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return null
    }

    const { data } = await supabase
      .from("users")
      .select()
      .eq("id", user.id)
      .single()

    if (!data || data.deleted) {
      return null
    }

    return {
      uid: user.id,
      userName: data.user_name,
      isAdmin: data.management,
      coverageArea: data.coverage_area,
    }
  } catch {
    return null
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userInfo = await getUserInfo()
  return <Dashboard userInfo={userInfo}>{children}</Dashboard>
}
