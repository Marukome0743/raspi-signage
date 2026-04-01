import { handleSupabaseError } from "@/src/services/errors"
import { createClient } from "@/src/supabase/client"
import type { AccountData, LoginData } from "@/src/supabase/database.types"

// Login (auth -> use UID as document key)
export const getAccountLoginData = async (
  email: string,
  password: string,
): Promise<LoginData | null> => {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !user) {
    return null
  }

  const uid = user.id
  const { data, error: queryError } = await supabase
    .from("users")
    .select()
    .eq("id", uid)
    .single()
  if (queryError) {
    handleSupabaseError(queryError)
  }
  if (!data || data.deleted) {
    return null
  }
  return {
    uid,
    email: data.email,
    userName: data.user_name,
    management: data.management,
    coverageArea: data.coverage_area,
    passFlg: data.pass_flg,
  }
}

// Check password reset flag
export const checkAccountPassKey = async (
  email: string,
): Promise<Omit<LoginData, "uid"> | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("deleted", false)
    .eq("email", email)
    .eq("pass_flg", true)
    .limit(1)
  if (error) {
    handleSupabaseError(error)
  }
  if (!data || data.length === 0) {
    return null
  }
  return {
    email: data[0].email,
    userName: data[0].user_name,
    management: data[0].management,
    coverageArea: data[0].coverage_area,
    passFlg: data[0].pass_flg,
  }
}

// Get a single account for account settings
export const getAccountDataClient = async (
  uid: string,
): Promise<AccountData | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("id", uid)
    .single()
  if (error) {
    handleSupabaseError(error)
  }
  if (!data) {
    return null
  }
  return {
    email: data.email,
    userName: data.user_name,
    management: data.management,
    coverageArea: data.coverage_area,
    passFlg: data.pass_flg,
    delete: data.deleted,
  }
}
