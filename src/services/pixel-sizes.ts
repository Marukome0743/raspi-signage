"use server"

import { query, queryOne } from "@/src/db/client"
import type { PixelSize, PixelSizeInfo } from "@/src/db/types"
import { handleDataError } from "@/src/services/errors"

// Register or retrieve CSS pixel size for content
export async function setContentPixelSize(
  orderId: string,
  pixelSizeId: string,
  width: number,
  height: number,
): Promise<PixelSizeInfo | null> {
  if (pixelSizeId === "") {
    let newPixel: { id: string } | null
    try {
      newPixel = await queryOne<{ id: string }>(
        `INSERT INTO pixel_sizes
              (width, height, pixel_width, pixel_height,
               margin_top, margin_left, display_content_flg, get_pixel_flg)
              VALUES ($1, $2, $1, $2, 0, 0, true, false)
         RETURNING id`,
        [width, height],
      )
      await query(
        `UPDATE contents SET pixel_size_id = $1 WHERE order_id = $2`,
        [newPixel?.id, orderId],
      )
    } catch (e) {
      handleDataError({
        message:
          e instanceof Error ? e.message : "ピクセルサイズ登録に失敗しました",
      })
    }

    return {
      width,
      height,
      pixelWidth: width,
      pixelHeight: height,
      marginTop: 0,
      marginLeft: 0,
      displayContentFlg: true,
      getPixelFlg: false,
    }
  }

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

  const pixelSizeResult: PixelSizeInfo = {
    width: row.width,
    height: row.height,
    pixelWidth: row.pixel_width,
    pixelHeight: row.pixel_height,
    marginTop: row.margin_top,
    marginLeft: row.margin_left,
    displayContentFlg: row.display_content_flg,
    getPixelFlg: row.get_pixel_flg,
  }

  if (row.get_pixel_flg) {
    try {
      await query(
        `UPDATE pixel_sizes
            SET pixel_width = $1, pixel_height = $2, get_pixel_flg = false
          WHERE id = $3`,
        [width, height, pixelSizeId],
      )
    } catch (e) {
      handleDataError({
        message:
          e instanceof Error ? e.message : "ピクセルサイズ更新に失敗しました",
      })
    }
  }
  return pixelSizeResult
}

// Initial setup for display adjustment screen
export async function createDisplayContent(
  orderId: string,
  pixel: Pick<PixelSizeInfo, "pixelWidth" | "pixelHeight">,
): Promise<PixelSizeInfo> {
  try {
    const newPixel = await queryOne<{ id: string }>(
      `INSERT INTO pixel_sizes
              (width, height, pixel_width, pixel_height,
               margin_top, margin_left, display_content_flg, get_pixel_flg)
              VALUES (0, 0, $1, $2, 0, 0, true, false)
         RETURNING id`,
      [pixel.pixelWidth, pixel.pixelHeight],
    )
    await query(`UPDATE contents SET pixel_size_id = $1 WHERE order_id = $2`, [
      newPixel?.id,
      orderId,
    ])
  } catch (e) {
    handleDataError({
      message:
        e instanceof Error ? e.message : "ピクセルサイズ登録に失敗しました",
    })
  }

  return {
    ...pixel,
    width: 0,
    height: 0,
    marginTop: 0,
    marginLeft: 0,
    displayContentFlg: true,
    getPixelFlg: false,
  }
}

// Update display adjustment parameters
export async function updateDisplayContent(
  pixelSizeId: string,
  height: number,
  width: number,
  marginTop: number,
  marginLeft: number,
): Promise<void> {
  try {
    await query(
      `UPDATE pixel_sizes
          SET height = $1, width = $2, margin_top = $3, margin_left = $4
        WHERE id = $5`,
      [height, width, marginTop, marginLeft, pixelSizeId],
    )
  } catch (e) {
    handleDataError({
      message:
        e instanceof Error ? e.message : "ピクセルサイズ更新に失敗しました",
    })
  }
}

// Unlock CSS pixel size for re-acquisition on Raspberry Pi signage display
export async function resetPixelSize(pixelSizeId: string): Promise<void> {
  try {
    await query(`UPDATE pixel_sizes SET get_pixel_flg = true WHERE id = $1`, [
      pixelSizeId,
    ])
  } catch (e) {
    handleDataError({
      message:
        e instanceof Error ? e.message : "ピクセルサイズリセットに失敗しました",
    })
  }
}
