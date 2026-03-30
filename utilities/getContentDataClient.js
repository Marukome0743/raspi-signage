import { supabase } from "../src/supabase/client"

export const getContentsDataClient = async (_target) => {
  const { data } = await supabase.from("contents").select().eq("deleted", false)
  return data
}

// コンテンツのリスト取得
export const getContentDataClient = async (target) => {
  // target is like "/order/{orderId}" or "order/{orderId}"
  const parts = target.split("/").filter(Boolean)
  const table = parts[0]
  const id = parts[1]
  if (table === "order") {
    const { data } = await supabase
      .from("orders")
      .select()
      .eq("id", id)
      .single()
    return data
  }
  return null
}

export const getOrderIdClient = async (areaId) => {
  const { data } = await supabase
    .from("contents")
    .select("order_id")
    .eq("area_id", areaId)
    .limit(1)
    .single()
  return data?.order_id ?? ""
}

// 表示画面調整コンテンツの取得
export const getContentPixelSizeId = async (orderId) => {
  const { data } = await supabase
    .from("contents")
    .select("pixel_size_id")
    .eq("order_id", orderId)
    .limit(1)
    .single()
  return data?.pixel_size_id ?? ""
}

// ピクセルサイズ情報の取得
export const getContentPixelSize = async (pixelSizeId) => {
  const { data } = await supabase
    .from("pixel_sizes")
    .select()
    .eq("id", pixelSizeId)
    .single()
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

export const getUserAccountList = async (_target) => {
  const { data } = await supabase.from("users").select().eq("deleted", false)
  if (!data) {
    return null
  }
  return data.map((user) => ({
    uid: user.id,
    email: user.email,
    userName: user.user_name,
    management: user.management,
    coverageArea: user.coverage_area,
    passFlg: user.pass_flg,
    delete: user.deleted,
  }))
}

// アカウント管理画面でアカウントを1件取得する方法
export const getAccountDataClient = async (uid) => {
  const { data } = await supabase.from("users").select().eq("id", uid).single()
  if (!data) {
    return null
  }
  return {
    email: data.email,
    userName: data.user_name,
    management: data.management,
    coverageArea: data.coverage_area,
    passFlg: data.pass_flg,
    delete: data.deleted,
  }
}

// ログイン(auth⇒UIDをドキュメントのキーに)
export const getAccountLoginData = async (email, password) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error || !authData.user) {
    return null
  }

  const uid = authData.user.id
  const { data } = await supabase.from("users").select().eq("id", uid).single()
  if (!data || data.deleted) {
    return null
  }
  return {
    uid,
    email: data.email,
    userName: data.user_name,
    management: data.management,
    coverageArea: data.coverage_area,
    passFlg: data.pass_flg,
  }
}

// パスワード初期化チェック
export const checkAccountPassKey = async (email) => {
  const { data } = await supabase
    .from("users")
    .select()
    .eq("deleted", false)
    .eq("email", email)
    .eq("pass_flg", true)
    .limit(1)
  if (!data || data.length === 0) {
    return null
  }
  return {
    email: data[0].email,
    userName: data[0].user_name,
    management: data[0].management,
    coverageArea: data[0].coverage_area,
    passFlg: data[0].pass_flg,
  }
}

export const getContentList = async (coverageAreaList) => {
  const { data } = await supabase
    .from("contents")
    .select()
    .eq("deleted", false)
    .in("area_id", coverageAreaList)
  if (!data) {
    return null
  }
  return data.map((item) => ({
    areaId: item.area_id,
    areaName: item.area_name,
    orderId: item.order_id,
    pixelSizeId: item.pixel_size_id,
    delete: item.deleted,
  }))
}
