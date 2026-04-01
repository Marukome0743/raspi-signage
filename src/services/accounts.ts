import { handleSupabaseError } from "@/src/services/errors"
import { createAdminClient } from "@/src/supabase/admin"
import { createClient } from "@/src/supabase/client"

interface CreateAccountUser {
  userName: string
  management: boolean
  coverageArea: string[]
  passFlg?: boolean
}

// Create account in account management
export const createAccountData = async (
  email: string,
  password: string,
  user: CreateAccountUser,
): Promise<void> => {
  const supabaseAdmin = createAdminClient()
  const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    handleSupabaseError(error)
  }

  const { error: insertError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    email,
    user_name: user.userName,
    management: user.management,
    coverage_area: user.coverageArea,
    pass_flg: user.passFlg ?? true,
    deleted: false,
  })
  if (insertError) {
    handleSupabaseError(insertError)
  }
}

interface UpdateAccountUser {
  userName: string
  management: boolean
  coverageArea: string[]
}

// Edit account in account management
export const updateAccountData = async (
  uid: string,
  user: UpdateAccountUser,
  email: string,
  nowPassword: string,
  newPassword: string,
): Promise<void> => {
  const supabase = createClient()
  if (newPassword) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: nowPassword,
    })
    if (signInError) {
      handleSupabaseError(signInError)
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (updateError) {
      handleSupabaseError(updateError)
    }
  }

  const { error } = await supabase
    .from("users")
    .update({
      user_name: user.userName,
      management: user.management,
      coverage_area: user.coverageArea,
    })
    .eq("id", uid)
  if (error) {
    handleSupabaseError(error)
  }
}

// Delete account in account management
export const deleteAccountData = async (uid: string): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("users")
    .update({ deleted: true })
    .eq("id", uid)
  if (error) {
    handleSupabaseError(error)
  }
}

// Reset password (dedicated function to avoid type casts)
export const resetPassword = async (
  uid: string,
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const supabase = createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (signInError) {
    handleSupabaseError(signInError)
  }
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (updateError) {
    handleSupabaseError(updateError)
  }
  const { error } = await supabase
    .from("users")
    .update({ pass_flg: false })
    .eq("id", uid)
  if (error) {
    handleSupabaseError(error)
  }
}
