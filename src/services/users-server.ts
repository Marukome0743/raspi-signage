"use server"

import type { UserAccount } from "@/src/db/types"
import { getUserAccountList } from "./users"

export async function getUserAccountListServer(): Promise<UserAccount[]> {
  return getUserAccountList()
}
