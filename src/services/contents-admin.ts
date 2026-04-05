import { handleSupabaseError } from "@/src/services/errors"
import { createAdminClient } from "@/src/supabase/admin"
import type { Order, PixelSizeInfo } from "@/src/supabase/database.types"

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

// Get pixel size info (admin / server-side)
export const getContentPixelSizeAdmin = async (
  pixelSizeId: string,
): Promise<PixelSizeInfo | null> => {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from("pixel_sizes")
    .select()
    .eq("id", pixelSizeId)
    .single()
  if (error) {
    handleSupabaseError(error)
  }
  if (!data) {
    return null
  }
  return {
    width: data.width,
    height: data.height,
    pixelWidth: data.pixel_width,
    pixelHeight: data.pixel_height,
    marginTop: data.margin_top,
    marginLeft: data.margin_left,
    displayContentFlg: data.display_content_flg,
    getPixelFlg: data.get_pixel_flg,
  }
}
