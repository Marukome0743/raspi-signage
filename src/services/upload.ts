import { createClient } from "@/src/supabase/client"
import type { ContentItem } from "@/src/supabase/database.types"
import { updateContentOrder } from "./contents"

const BUCKET = "signage-contents"

// Upload content to Supabase storage
export const postContent = async (
  docId: string,
  content: File,
  type: ContentItem["type"],
  duration: number,
): Promise<void> => {
  const supabase = createClient()
  if (!content.name) {
    return
  }

  const { data: contentsData } = await supabase
    .from("contents")
    .select()
    .eq("deleted", false)
    .eq("order_id", docId)
    .limit(1)
    .single()
  if (!contentsData) {
    return
  }

  const areaId = contentsData.area_id
  const filePath = `${areaId}/${content.name}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, content, { upsert: true })
  if (error) {
    console.log("Upload error:", error)
    return
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

  let viewTime = 2000
  if (duration !== 0) {
    viewTime = duration
  }

  // Get current order to append to hidden
  const { data: order } = await supabase
    .from("orders")
    .select()
    .eq("id", docId)
    .single()

  const currentHidden = order?.hidden ?? []
  await updateContentOrder(docId, {
    hidden: [
      ...currentHidden,
      {
        fileName: content.name,
        path: publicUrl,
        type,
        viewTime,
      },
    ],
  })
}
