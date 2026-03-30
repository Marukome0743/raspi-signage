import { supabase } from "../src/supabase/client"
import { updateContentOrder } from "./setContentData"

const BUCKET = "signage-contents"

// コンテンツ登録時のsupabase接続等処理
export const postContent = async (
  docId,
  content,
  type,
  duration,
  _callbackfn = undefined,
) => {
  if (!content.name) {
    return
  }

  const { data: contentsData } = await supabase
    .from("contents")
    .select("area_id")
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
    .select("hidden")
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
