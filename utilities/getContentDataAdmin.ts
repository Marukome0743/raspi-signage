import type { Order } from "../src/supabase/database.types"
import { supabaseAdmin } from "../src/supabase/server"

// Get list of orders by orderId
export const getContentDataAdmin = async (
  orderId: string,
): Promise<Order | null> => {
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

// Get orderId by areaId
export const getOrderIdAdmin = async (
  areaId: string,
): Promise<{ orderId: string; pixelSizeId: string }> => {
  const { data } = await supabaseAdmin
    .from("contents")
    .select()
    .eq("area_id", areaId)
    .limit(1)
    .single()
  return {
    orderId: data?.order_id ?? "",
    pixelSizeId: data?.pixel_size_id ?? "",
  }
}
