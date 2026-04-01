import { handleSupabaseError } from "@/src/services/errors"
import { createClient } from "@/src/supabase/client"
import type {
  Content,
  ContentListItem,
  Order,
  PixelSizeInfo,
} from "@/src/supabase/database.types"

// Get all non-deleted contents
export const getContentsDataClient = async (): Promise<Content[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("contents")
    .select()
    .eq("deleted", false)
  if (error) {
    handleSupabaseError(error)
  }
  return data
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = createClient()
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

// Get pixel size ID for an order
export const getContentPixelSizeId = async (
  orderId: string,
): Promise<string> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("contents")
    .select("pixel_size_id")
    .eq("order_id", orderId)
    .limit(1)
    .single()
  if (error) {
    handleSupabaseError(error)
  }
  return data?.pixel_size_id ?? ""
}

// Get pixel size info
export const getContentPixelSize = async (
  pixelSizeId: string,
): Promise<PixelSizeInfo | null> => {
  const supabase = createClient()
  const { data, error } = await supabase
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

// Get content list by coverage area
export const getContentList = async (
  coverageAreaList: string[],
): Promise<ContentListItem[]> => {
  const supabase = createClient()
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

// Upsert order
export const setContentOrder = async (
  docId: string,
  content: Partial<Order>,
): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("orders")
    .upsert({ id: docId, ...content })
  if (error) {
    handleSupabaseError(error)
  }
}

// Update order
export const updateContentOrder = async (
  docId: string,
  content: Partial<Order>,
): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("orders")
    .update(content)
    .eq("id", docId)
  if (error) {
    handleSupabaseError(error)
  }
}

// Add area in area management
export const createContentsData = async (areaName: string): Promise<void> => {
  const supabase = createClient()
  const { data: newOrder, error: orderError } = await supabase
    .from("orders")
    .insert({ set1: [], hidden: [] })
    .select()
    .single()
  if (orderError) {
    handleSupabaseError(orderError)
  }

  const { count } = await supabase
    .from("contents")
    .select("*", { count: "exact", head: true })

  const { error: contentError } = await supabase.from("contents").insert({
    area_name: areaName,
    order_id: newOrder?.id,
    area_id: (count ?? 0).toString(),
    deleted: false,
  })
  if (contentError) {
    handleSupabaseError(contentError)
  }
}

// Edit area in area management
export const updateContentsData = async (
  index: number,
  contents: ContentListItem[],
  areaName: string,
): Promise<void> => {
  const supabase = createClient()
  const orderId = contents[index].orderId
  const { error } = await supabase
    .from("contents")
    .update({ area_name: areaName })
    .eq("order_id", orderId)
  if (error) {
    handleSupabaseError(error)
  }
}

// Delete area in area management
export const deleteContentsData = async (
  index: number,
  contents: ContentListItem[],
): Promise<void> => {
  const supabase = createClient()
  const orderId = contents[index].orderId
  const { error } = await supabase
    .from("contents")
    .update({ deleted: true })
    .eq("order_id", orderId)
  if (error) {
    handleSupabaseError(error)
  }
}

// Map Content to ContentListItem
export function mapContentToListItem(content: Content): ContentListItem {
  return {
    areaId: content.area_id,
    areaName: content.area_name,
    orderId: content.order_id,
    pixelSizeId: content.pixel_size_id,
    delete: content.deleted,
  }
}

// Filter out deleted items and empty objects
export function filterActiveDisplayItems<T extends { delete?: boolean }>(
  items: T[],
): T[] {
  return items.filter((item) => !item.delete && Object.keys(item).length > 0)
}
