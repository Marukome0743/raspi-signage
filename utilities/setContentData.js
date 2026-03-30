import { supabase } from "../src/supabase/client"
import { supabaseAdmin } from "../src/supabase/server"

export const setContentData = async (_content) => {
  // Legacy: contents/group0/src - not actively used in current flow
  // Kept for compatibility
}

// コンテンツ更新処理（削除含む）
export const setContentOrder = async (docId, content) => {
  await supabase.from("orders").upsert({ id: docId, ...content })
}

// コンテンツ登録処理
export const updateContentOrder = async (docId, content) => {
  await supabase.from("orders").update(content).eq("id", docId)
}

// CSSピクセルサイズの登録、またコンテンツサイズの取得
export const setContentPixelSize = async (
  orderId,
  pixelSizeId,
  width,
  height,
) => {
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
      .update({ pixel_size_id: newPixel.id })
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

  const pixelSize = {
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

// 表示画面調整画面での初期設定
export const createDisplayContent = async (orderId, pixel) => {
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
    .update({ pixel_size_id: newPixel.id })
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

// 表示画面調整の項目更新
export const updateDisplayContent = async (
  pixelSizeId,
  height,
  width,
  marginTop,
  marginLeft,
) => {
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

// ラズパイサイネージ表示画面でCSSピクセルサイズを再取得するためにロックを解除
export const resetPixelSize = async (pixelSizeId) => {
  await supabase
    .from("pixel_sizes")
    .update({ get_pixel_flg: true })
    .eq("id", pixelSizeId)
}

// エリア管理画面でエリア追加を実行
export const createContentsData = async (areaName) => {
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
    order_id: newOrder.id,
    area_id: (count ?? 0).toString(),
    deleted: false,
  })
}

// エリア管理画面でエリア編集を実行
export const updateContentsData = async (index, contents, areaName) => {
  const orderId = contents[index].orderId
  await supabase
    .from("contents")
    .update({ area_name: areaName })
    .eq("order_id", orderId)
}

// エリア管理画面でエリア削除を実行
export const deleteContentsData = async (index, contents) => {
  const orderId = contents[index].orderId
  await supabase
    .from("contents")
    .update({ deleted: true })
    .eq("order_id", orderId)
}

// アカウント一覧管理画面でアカウント作成を実行
export const createAccountData = async (email, password, user) => {
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

// アカウント一覧管理画面でアカウント編集を実行
export const updateAccountData = async (
  uid,
  user,
  email,
  nowPassword,
  newPassword,
) => {
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

// アカウント一覧管理画面でアカウント削除を実行
export const deleteAccountData = async (uid) => {
  await supabase.from("users").update({ deleted: true }).eq("id", uid)
}

// アカウント一覧管理画面でアカウント編集を実行
export const resetAccountPassword = async (uid, newPassword) => {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(uid, {
    password: newPassword,
  })
  if (error) {
    console.log(error)
    return
  }

  await supabaseAdmin.from("users").update({ pass_flg: true }).eq("id", uid)
}
