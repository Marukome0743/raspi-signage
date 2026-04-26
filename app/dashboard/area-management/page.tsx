import AreaManagementClient from "@/components/dashboard/AreaManagementClient"
import type { Content } from "@/src/db/types"
import { getContentsDataServer } from "@/src/services/contents-server"

export default async function AreaManagementPage() {
  let initialData: Content[] | null = null
  let error: string | null = null
  try {
    initialData = await getContentsDataServer()
  } catch (e) {
    error = e instanceof Error ? e.message : "データ取得に失敗しました"
  }
  return <AreaManagementClient initialData={initialData} error={error} />
}
