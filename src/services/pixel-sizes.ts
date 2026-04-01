import { handleSupabaseError } from "@/src/services/errors"
import { createClient } from "@/src/supabase/client"
import type { PixelSizeInfo } from "@/src/supabase/database.types"

// Register or retrieve CSS pixel size for content
export const setContentPixelSize = async (
  orderId: string,
  pixelSizeId: string,
  width: number,
  height: number,
): Promise<PixelSizeInfo | null> => {
  const supabase = createClient()
  if (pixelSizeId === "") {
    const pixelSize = {
      width,
      height,
      pixel_width: width,
      pixel_height: height,
      margin_top: 0,
      margin_left: 0,
      display_content_flg: true,
      get_pixel_flg: false,
    }
    const { data: newPixel, error: insertError } = await supabase
      .from("pixel_sizes")
      .insert(pixelSize)
      .select()
      .single()
    if (insertError) {
      handleSupabaseError(insertError)
    }

    const { error: updateError } = await supabase
      .from("contents")
      .update({ pixel_size_id: newPixel?.id })
      .eq("order_id", orderId)
    if (updateError) {
      handleSupabaseError(updateError)
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

  const pixelSizeResult: PixelSizeInfo = {
    width: data.width,
    height: data.height,
    pixelWidth: data.pixel_width,
    pixelHeight: data.pixel_height,
    marginTop: data.margin_top,
    marginLeft: data.margin_left,
    displayContentFlg: data.display_content_flg,
    getPixelFlg: data.get_pixel_flg,
  }

  if (!data.get_pixel_flg) {
    const { error: updateError } = await supabase
      .from("pixel_sizes")
      .update({
        pixel_width: width,
        pixel_height: height,
        get_pixel_flg: false,
      })
      .eq("id", pixelSizeId)
    if (updateError) {
      handleSupabaseError(updateError)
    }
  }
  return pixelSizeResult
}

// Initial setup for display adjustment screen
export const createDisplayContent = async (
  orderId: string,
  pixel: Pick<PixelSizeInfo, "pixelWidth" | "pixelHeight">,
): Promise<PixelSizeInfo> => {
  const supabase = createClient()
  const pixelSize = {
    width: 0,
    height: 0,
    pixel_width: pixel.pixelWidth,
    pixel_height: pixel.pixelHeight,
    margin_top: 0,
    margin_left: 0,
    display_content_flg: true,
    get_pixel_flg: false,
  }
  const { data: newPixel, error: insertError } = await supabase
    .from("pixel_sizes")
    .insert(pixelSize)
    .select()
    .single()
  if (insertError) {
    handleSupabaseError(insertError)
  }

  const { error: updateError } = await supabase
    .from("contents")
    .update({ pixel_size_id: newPixel?.id })
    .eq("order_id", orderId)
  if (updateError) {
    handleSupabaseError(updateError)
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
export const updateDisplayContent = async (
  pixelSizeId: string,
  height: number,
  width: number,
  marginTop: number,
  marginLeft: number,
): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("pixel_sizes")
    .update({
      height,
      width,
      margin_top: marginTop,
      margin_left: marginLeft,
    })
    .eq("id", pixelSizeId)
  if (error) {
    handleSupabaseError(error)
  }
}

// Unlock CSS pixel size for re-acquisition on Raspberry Pi signage display
export const resetPixelSize = async (pixelSizeId: string): Promise<void> => {
  const supabase = createClient()
  const { error } = await supabase
    .from("pixel_sizes")
    .update({ get_pixel_flg: true })
    .eq("id", pixelSizeId)
  if (error) {
    handleSupabaseError(error)
  }
}
