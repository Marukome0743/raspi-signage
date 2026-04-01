import { handleSupabaseError } from "@/src/services/errors"
import { createClient } from "@/src/supabase/client"
import type { UserAccount } from "@/src/supabase/database.types"

export const getUserAccountList = async (): Promise<UserAccount[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("deleted", false)
  if (error) {
    handleSupabaseError(error)
  }
  return (data ?? []).map((user) => ({
    uid: user.id,
    email: user.email,
    userName: user.user_name,
    management: user.management,
    coverageArea: user.coverage_area,
    passFlg: user.pass_flg,
    delete: user.deleted,
  }))
}
