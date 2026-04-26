// src/db/types.ts
// Domain types for the raspi-signage project.
// These types are independent of the underlying storage technology
// (Neon Postgres in production, plain Postgres locally).

export type ContentItem = {
  fileName: string
  path: string
  type: "image" | "video"
  viewTime: number
}

export type Order = {
  id: string
  set1: ContentItem[]
  hidden: ContentItem[]
}

export type Content = {
  area_id: string
  area_name: string
  order_id: string
  pixel_size_id: string | null
  deleted: boolean
}

export type PixelSize = {
  id: string
  width: number
  height: number
  pixel_width: number
  pixel_height: number
  margin_top: number
  margin_left: number
  display_content_flg: boolean
  get_pixel_flg: boolean
}

export type User = {
  id: string
  email: string
  user_name: string
  management: boolean
  coverage_area: string[]
  pass_flg: boolean
  deleted: boolean
}

// Utility function return types

export interface PixelSizeInfo {
  width: number
  height: number
  pixelWidth: number
  pixelHeight: number
  marginTop: number
  marginLeft: number
  displayContentFlg: boolean
  getPixelFlg: boolean
}

interface BaseUserFields {
  email: string
  userName: string
  management: boolean
  coverageArea: string[]
  passFlg: boolean
}

export interface UserAccount extends BaseUserFields {
  uid: string
  delete: boolean
}

export interface AccountData extends BaseUserFields {
  delete: boolean
}

export interface LoginData extends BaseUserFields {
  uid: string
}

export interface ContentListItem {
  areaId: string
  areaName: string
  orderId: string
  pixelSizeId: string | null
  delete: boolean
}

export interface UserInfo {
  uid: string
  userName: string
  isAdmin: boolean
  coverageArea: string[]
}

export interface OrderContextValue {
  orderId: string | null
  setOrderId: (id: string | null) => void
  progress: boolean
  setProgress: (progress: boolean) => void
}
