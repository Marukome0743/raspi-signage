import AccountSettingManagementClient from "@/components/dashboard/AccountSettingManagementClient"
import { createClient } from "@/src/supabase/server"

export default async function AccountSettingManagementPage() {
  let uid: string | null = null
  let error: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    uid = user?.id ?? null
  } catch (e) {
    error = e instanceof Error ? e.message : "データ取得に失敗しました"
  }
  return <AccountSettingManagementClient uid={uid} error={error} />
}
