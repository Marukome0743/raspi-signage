// Pure helpers used by both client components and server-side code.
// Kept separate from "use server" service files because Server Action files
// can only export async functions.

import type { Content, ContentListItem } from "@/src/db/types"

export function mapContentToListItem(content: Content): ContentListItem {
  return {
    areaId: content.area_id,
    areaName: content.area_name,
    orderId: content.order_id,
    pixelSizeId: content.pixel_size_id,
    delete: content.deleted,
  }
}

export function filterActiveDisplayItems<T extends Record<string, unknown>>(
  items: T[],
): T[] {
  return items.filter((item) => !item.delete && Object.keys(item).length > 0)
}
