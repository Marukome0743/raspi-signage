"use server"

import { queryOne } from "@/src/db/client"
import type { Order, PixelSize, PixelSizeInfo } from "@/src/db/types"
import { handleDataError } from "@/src/services/errors"

// Get order by orderId (admin / server-side)
export async function getContentDataAdmin(
  orderId: string,
): Promise<Order | null> {
  try {
    return await queryOne<Order>(
      `SELECT id, set1, hidden FROM orders WHERE id = $1`,
      [orderId],
    )
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "オーダー取得に失敗しました",
    })
  }
}

// Get orderId by areaId (admin / server-side)
export async function getOrderIdAdmin(
  areaId: string,
): Promise<{ orderId: string; pixelSizeId: string }> {
  let row: { order_id: string | null; pixel_size_id: string | null } | null
  try {
    row = await queryOne(
      `SELECT order_id, pixel_size_id FROM contents WHERE area_id = $1 LIMIT 1`,
      [areaId],
    )
  } catch (e) {
    handleDataError({
      message: e instanceof Error ? e.message : "コンテンツ取得に失敗しました",
    })
  }
  return {
    orderId: row?.order_id ?? "",
    pixelSizeId: row?.pixel_size_id ?? "",
  }
}

// Get pixel size info (admin / server-side)
export async function getContentPixelSizeAdmin(
  pixelSizeId: string,
): Promise<PixelSizeInfo | null> {
  let row: PixelSize | null
  try {
    row = await queryOne<PixelSize>(
      `SELECT id, width, height, pixel_width, pixel_height,
              margin_top, margin_left, display_content_flg, get_pixel_flg
         FROM pixel_sizes
        WHERE id = $1`,
      [pixelSizeId],
    )
  } catch (e) {
    handleDataError({
      message:
        e instanceof Error ? e.message : "ピクセルサイズ取得に失敗しました",
    })
  }
  if (!row) {
    return null
  }
  return {
    width: row.width,
    height: row.height,
    pixelWidth: row.pixel_width,
    pixelHeight: row.pixel_height,
    marginTop: row.margin_top,
    marginLeft: row.margin_left,
    displayContentFlg: row.display_content_flg,
    getPixelFlg: row.get_pixel_flg,
  }
}
