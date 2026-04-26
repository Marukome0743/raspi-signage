import { headers } from "next/headers"
import Dashboard from "@/components/dashboard/Dashboard"
import { getAuth } from "@/src/auth/server"
import { queryOne } from "@/src/db/client"
import type { User, UserInfo } from "@/src/db/types"

async function getUserInfo(): Promise<UserInfo | null> {
  try {
    const session = await getAuth().api.getSession({
      headers: await headers(),
    })
    const uid = session?.user?.id
    if (!uid) {
      return null
    }

    const row = await queryOne<User>(
      `SELECT id, email, name AS user_name, management, coverage_area, pass_flg, deleted
         FROM "user"
        WHERE id = $1`,
      [uid],
    )

    if (!row || row.deleted) {
      return null
    }

    return {
      uid: row.id,
      userName: row.user_name,
      isAdmin: row.management,
      coverageArea: row.coverage_area,
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
