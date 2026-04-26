import UserAccountManagementClient from "@/components/dashboard/UserAccountManagementClient"
import type { ContentListItem, UserAccount } from "@/src/db/types"
import { mapContentToListItem } from "@/src/services/content-helpers"
import { getContentsDataServer } from "@/src/services/contents-server"
import { getUserAccountListServer } from "@/src/services/users-server"

export default async function UserAccountManagementPage() {
  let initialUserList: UserAccount[] | null = null
  let initialContentList: ContentListItem[] | null = null
  let error: string | null = null
  try {
    const [userList, contents] = await Promise.all([
      getUserAccountListServer(),
      getContentsDataServer(),
    ])
    initialUserList = userList
    initialContentList = contents.map(mapContentToListItem)
  } catch (e) {
    error = e instanceof Error ? e.message : "データ取得に失敗しました"
  }
  return (
    <UserAccountManagementClient
      initialUserList={initialUserList}
      initialContentList={initialContentList}
      error={error}
    />
  )
}
