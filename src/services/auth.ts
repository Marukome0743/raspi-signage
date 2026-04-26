"use server"

import { queryOne } from "@/src/db/client"
import type { AccountData, LoginData, User } from "@/src/db/types"
import { handleDataError } from "@/src/services/errors"

// Fetch the user profile after a successful Better Auth sign-in.
// Returns null if the account has been soft-deleted.
export async function getAccountLoginData(
  uid: string,
): Promise<LoginData | null> {
  let row: User | null
  try {
    row = await queryOne<User>(
      `SELECT id, email, name AS user_name, management, coverage_area, pass_flg, deleted
         FROM "user"
        WHERE id = $1`,
      [uid],
    )
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "ユーザー取得に失敗しました",
    })
  }

  if (!row || row.deleted) {
    return null
  }
  return {
    uid: row.id,
    email: row.email,
    userName: row.user_name,
    management: row.management,
    coverageArea: row.coverage_area,
    passFlg: row.pass_flg,
  }
}

// Check password reset flag
export async function checkAccountPassKey(
  email: string,
): Promise<Omit<LoginData, "uid"> | null> {
  let row: User | null
  try {
    row = await queryOne<User>(
      `SELECT id, email, name AS user_name, management, coverage_area, pass_flg, deleted
         FROM "user"
        WHERE deleted = false
          AND email = $1
          AND pass_flg = true
        LIMIT 1`,
      [email],
    )
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "ユーザー取得に失敗しました",
    })
  }
  if (!row) {
    return null
  }
  return {
    email: row.email,
    userName: row.user_name,
    management: row.management,
    coverageArea: row.coverage_area,
    passFlg: row.pass_flg,
  }
}

// Get a single account for account settings
export async function getAccountDataClient(
  uid: string,
): Promise<AccountData | null> {
  let row: User | null
  try {
    row = await queryOne<User>(
      `SELECT id, email, name AS user_name, management, coverage_area, pass_flg, deleted
         FROM "user"
        WHERE id = $1`,
      [uid],
    )
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "ユーザー取得に失敗しました",
    })
  }
  if (!row) {
    return null
  }
  return {
    email: row.email,
    userName: row.user_name,
    management: row.management,
    coverageArea: row.coverage_area,
    passFlg: row.pass_flg,
    delete: row.deleted,
  }
}
