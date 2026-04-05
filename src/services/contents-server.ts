import { handleSupabaseError } from "@/src/services/errors"
import type {
  Content,
  ContentListItem,
  Order,
} from "@/src/supabase/database.types"
import { createClient as createServerClient } from "@/src/supabase/server"

// Server-side: Get all non-deleted contents
export const getContentsDataServer = async (): Promise<Content[]> => {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("contents")
    .select()
    .eq("deleted", false)
  if (error) {
    handleSupabaseError(error)
  }
  return data
}

// Server-side: Get content list by coverage area
export const getContentListServer = async (
  coverageAreaList: string[],
): Promise<ContentListItem[]> => {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("contents")
    .select()
    .eq("deleted", false)
    .in("area_id", coverageAreaList)
  if (error) {
    handleSupabaseError(error)
  }
  return (data ?? []).map((item) => ({
    areaId: item.area_id,
    areaName: item.area_name,
    orderId: item.order_id,
    pixelSizeId: item.pixel_size_id,
    delete: item.deleted,
  }))
}

// Server-side: Get order by ID
export async function getOrderByIdServer(
  orderId: string,
): Promise<Order | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("orders")
    .select()
    .eq("id", orderId)
    .single()
  if (error) {
    handleSupabaseError(error)
  }
  return data
}
