import { handleSupabaseError } from "@/src/services/errors"
import { createAdminClient } from "@/src/supabase/admin"
import type { Order } from "@/src/supabase/database.types"

// Get order by orderId (admin)
export const getContentDataAdmin = async (
  orderId: string,
): Promise<Order | null> => {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select()
    .eq("id", orderId)
    .single()
  if (error) {
    handleSupabaseError(error)
  }
  return data
}

// Get orderId by areaId (admin)
export const getOrderIdAdmin = async (
  areaId: string,
): Promise<{ orderId: string; pixelSizeId: string }> => {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from("contents")
    .select()
    .eq("area_id", areaId)
    .limit(1)
    .single()
  if (error) {
    handleSupabaseError(error)
  }
  return {
    orderId: data?.order_id ?? "",
    pixelSizeId: data?.pixel_size_id ?? "",
  }
}
