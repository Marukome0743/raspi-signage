import { headers } from "next/headers"
import AccountSettingManagementClient from "@/components/dashboard/AccountSettingManagementClient"
import { getAuth } from "@/src/auth/server"

export default async function AccountSettingManagementPage() {
  let uid: string | null = null
  let error: string | null = null
  try {
    const session = await getAuth().api.getSession({
      headers: await headers(),
    })
    uid = session?.user?.id ?? null
  } catch (e) {
    error = e instanceof Error ? e.message : "データ取得に失敗しました"
  }
  return <AccountSettingManagementClient uid={uid} error={error} />
}
