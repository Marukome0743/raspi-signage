import { handleSupabaseError } from "@/src/services/errors"
import type { UserAccount } from "@/src/supabase/database.types"
import { createClient as createServerClient } from "@/src/supabase/server"

// Server-side: Get user account list
export const getUserAccountListServer = async (): Promise<UserAccount[]> => {
  const supabase = await createServerClient()
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
