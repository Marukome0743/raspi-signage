"use server"

import { getAuth } from "@/src/auth/server"
import { query } from "@/src/db/client"
import { handleDataError } from "@/src/services/errors"

interface CreateAccountUser {
  userName: string
  management: boolean
  coverageArea: string[]
  passFlg?: boolean
}

// Create account in account management.
// Better Auth handles email/password registration server-side; the resulting
// user row is then patched with the application-specific fields.
export async function createAccountData(
  email: string,
  password: string,
  user: CreateAccountUser,
): Promise<void> {
  let uid: string
  try {
    const result = await getAuth().api.signUpEmail({
      body: { email, password, name: user.userName },
    })
    uid = result.user.id
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "アカウント作成に失敗しました",
    })
  }

  try {
    await query(
      `UPDATE "user"
          SET management = $1,
              coverage_area = $2,
              pass_flg = $3,
              deleted = false
        WHERE id = $4`,
      [user.management, user.coverageArea, user.passFlg ?? true, uid],
    )
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "アカウント保存に失敗しました",
    })
  }
}

interface UpdateAccountUser {
  userName: string
  management: boolean
  coverageArea: string[]
}

// Edit account fields (no password change).
// Password change is handled by Better Auth client (auth/client.ts) before
// this is called.
export async function updateAccountData(
  uid: string,
  user: UpdateAccountUser,
  _email: string,
  _nowPassword: string,
  _newPassword: string,
): Promise<void> {
  try {
    await query(
      `UPDATE "user"
          SET name = $1,
              management = $2,
              coverage_area = $3
        WHERE id = $4`,
      [user.userName, user.management, user.coverageArea, uid],
    )
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "アカウント更新に失敗しました",
    })
  }
}

// Delete account (soft delete).
export async function deleteAccountData(uid: string): Promise<void> {
  try {
    await query(`UPDATE "user" SET deleted = true WHERE id = $1`, [uid])
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "アカウント削除に失敗しました",
    })
  }
}

// Mark a forced-password-reset flag as completed.
// The actual password change is performed via Better Auth client first.
export async function resetPassword(
  uid: string,
  _email: string,
  _currentPassword: string,
  _newPassword: string,
): Promise<void> {
  try {
    await query(`UPDATE "user" SET pass_flg = false WHERE id = $1`, [uid])
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "アカウント更新に失敗しました",
    })
  }
}
