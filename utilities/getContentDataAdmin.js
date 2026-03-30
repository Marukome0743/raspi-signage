import { supabaseAdmin } from "../src/supabase/server"

// オーダーに紐づくリスト一覧
export const getContentDataAdmin = async (orderId) => {
  const { data } = await supabaseAdmin
    .from("orders")
    .select()
    .eq("id", orderId)
    .single()
  if (!data) {
    return null
  }
  return data
}

// オーダーID取得
export const getOrderIdAdmin = async (areaId) => {
  const { data } = await supabaseAdmin
    .from("contents")
    .select("order_id, pixel_size_id")
    .eq("area_id", areaId)
    .limit(1)
    .single()
  return {
    orderId: data?.order_id ?? "",
    pixelSizeId: data?.pixel_size_id ?? "",
  }
}
