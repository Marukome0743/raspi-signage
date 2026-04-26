"use server"

import { queryRows } from "@/src/db/client"
import type { User, UserAccount } from "@/src/db/types"
import { handleDataError } from "@/src/services/errors"

export async function getUserAccountList(): Promise<UserAccount[]> {
  let rows: User[]
  try {
    rows = await queryRows<User>(
      `SELECT id, email, name AS user_name, management, coverage_area, pass_flg, deleted
         FROM "user"
        WHERE deleted = false`,
    )
  } catch (e) {
    handleDataError({
      message:
        e instanceof Error ? e.message : "ユーザー一覧取得に失敗しました",
    })
  }
  return rows.map((user) => ({
    uid: user.id,
    email: user.email,
    userName: user.user_name,
    management: user.management,
    coverageArea: user.coverage_area,
    passFlg: user.pass_flg,
    delete: user.deleted,
  }))
}
