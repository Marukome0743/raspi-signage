import { supabase } from "../src/supabase/client"
import type {
  ContentListItem,
  Order,
  PixelSizeInfo,
} from "../src/supabase/database.types"
import { supabaseAdmin } from "../src/supabase/server"

export const setContentData = async (_content: unknown): Promise<void> => {
  // Legacy: contents/group0/src - not actively used in current flow
  // Kept for compatibility
}

// Update content order (including delete)
export const setContentOrder = async (
  docId: string,
  content: Partial<Order>,
): Promise<void> => {
  await supabase.from("orders").upsert({ id: docId, ...content })
}

// Register content
export const updateContentOrder = async (
  docId: string,
  content: Partial<Order>,
): Promise<void> => {
  await supabase.from("orders").update(content).eq("id", docId)
}

// Register or retrieve CSS pixel size for content
export const setContentPixelSize = async (
  orderId: string,
  pixelSizeId: string,
  width: number,
  height: number,
): Promise<PixelSizeInfo | null> => {
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
    const { data: newPixel } = await supabase
      .from("pixel_sizes")
      .insert(pixelSize)
      .select()
      .single()

    await supabase
      .from("contents")
      .update({ pixel_size_id: newPixel?.id })
      .eq("order_id", orderId)

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

  const { data } = await supabase
    .from("pixel_sizes")
    .select()
    .eq("id", pixelSizeId)
    .single()
  if (!data) {
    return null
  }

  const pixelSize: PixelSizeInfo = {
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
    await supabase
      .from("pixel_sizes")
      .update({
        pixel_width: width,
        pixel_height: height,
        get_pixel_flg: false,
      })
      .eq("id", pixelSizeId)
  }
  return pixelSize
}

// Initial setup for display adjustment screen
export const createDisplayContent = async (
  orderId: string,
  pixel: Pick<PixelSizeInfo, "pixelWidth" | "pixelHeight">,
): Promise<PixelSizeInfo> => {
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
  const { data: newPixel } = await supabase
    .from("pixel_sizes")
    .insert(pixelSize)
    .select()
    .single()

  await supabase
    .from("contents")
    .update({ pixel_size_id: newPixel?.id })
    .eq("order_id", orderId)

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
  await supabase
    .from("pixel_sizes")
    .update({
      height,
      width,
      margin_top: marginTop,
      margin_left: marginLeft,
    })
    .eq("id", pixelSizeId)
}

// Unlock CSS pixel size for re-acquisition on Raspberry Pi signage display
export const resetPixelSize = async (pixelSizeId: string): Promise<void> => {
  await supabase
    .from("pixel_sizes")
    .update({ get_pixel_flg: true })
    .eq("id", pixelSizeId)
}

// Add area in area management
export const createContentsData = async (areaName: string): Promise<void> => {
  const { data: newOrder } = await supabase
    .from("orders")
    .insert({ set1: [], hidden: [] })
    .select()
    .single()

  const { count } = await supabase
    .from("contents")
    .select("*", { count: "exact", head: true })

  await supabase.from("contents").insert({
    area_name: areaName,
    order_id: newOrder?.id,
    area_id: (count ?? 0).toString(),
    deleted: false,
  })
}

// Edit area in area management
export const updateContentsData = async (
  index: number,
  contents: ContentListItem[],
  areaName: string,
): Promise<void> => {
  const orderId = contents[index].orderId
  await supabase
    .from("contents")
    .update({ area_name: areaName })
    .eq("order_id", orderId)
}

// Delete area in area management
export const deleteContentsData = async (
  index: number,
  contents: ContentListItem[],
): Promise<void> => {
  const orderId = contents[index].orderId
  await supabase
    .from("contents")
    .update({ deleted: true })
    .eq("order_id", orderId)
}

interface CreateAccountUser {
  userName: string
  management: boolean
  coverageArea: string[]
  passFlg?: boolean
}

// Create account in account management
export const createAccountData = async (
  email: string,
  password: string,
  user: CreateAccountUser,
): Promise<void> => {
  const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    console.log("登録されています")
    return
  }

  await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    email,
    user_name: user.userName,
    management: user.management,
    coverage_area: user.coverageArea,
    pass_flg: user.passFlg ?? true,
    deleted: false,
  })
}

interface UpdateAccountUser {
  userName: string
  management: boolean
  coverageArea: string[]
}

// Edit account in account management
export const updateAccountData = async (
  uid: string,
  user: UpdateAccountUser,
  email: string,
  nowPassword: string,
  newPassword: string,
): Promise<void> => {
  if (newPassword) {
    // Re-authenticate then update password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: nowPassword,
    })
    if (signInError) {
      console.log(signInError)
      return
    }
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (updateError) {
      console.log(updateError)
      return
    }
  }

  await supabase
    .from("users")
    .update({
      user_name: user.userName,
      management: user.management,
      coverage_area: user.coverageArea,
    })
    .eq("id", uid)
}

// Delete account in account management
export const deleteAccountData = async (uid: string): Promise<void> => {
  await supabase.from("users").update({ deleted: true }).eq("id", uid)
}

// Reset account password in account management
export const resetAccountPassword = async (
  uid: string,
  newPassword: string,
): Promise<void> => {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(uid, {
    password: newPassword,
  })
  if (error) {
    console.log(error)
    return
  }

  await supabaseAdmin.from("users").update({ pass_flg: true }).eq("id", uid)
}
