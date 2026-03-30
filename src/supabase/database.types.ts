// src/supabase/database.types.ts

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

// Supabase Database型（ジェネリクス用）
export interface Database {
  public: {
    Tables: {
      orders: {
        Row: Order
        Insert: Partial<Order>
        Update: Partial<Order>
        Relationships: []
      }
      contents: {
        Row: Content
        Insert: Partial<Content>
        Update: Partial<Content>
        Relationships: []
      }
      pixel_sizes: {
        Row: PixelSize
        Insert: Omit<PixelSize, "id">
        Update: Partial<PixelSize>
        Relationships: []
      }
      users: {
        Row: User
        Insert: User
        Update: Partial<User>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ユーティリティ関数の戻り値型

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

export interface UserAccount {
  uid: string
  email: string
  userName: string
  management: boolean
  coverageArea: string[]
  passFlg: boolean
  delete: boolean
}

export interface AccountData {
  email: string
  userName: string
  management: boolean
  coverageArea: string[]
  passFlg: boolean
  delete: boolean
}

export interface LoginData {
  uid: string
  email: string
  userName: string
  management: boolean
  coverageArea: string[]
  passFlg: boolean
}

export interface ContentListItem {
  areaId: string
  areaName: string
  orderId: string
  pixelSizeId: string | null
  delete: boolean
}

// OrderContextの型定義
export interface OrderContextValue {
  orderId: string | null
  setOrderId: (id: string | null) => void
  isAdmin: boolean
  setIsAdmin: (admin: boolean) => void
  currentUser: import("@supabase/supabase-js").User | null | undefined
  uid: string | undefined
  setUid: (uid: string | undefined) => void
  userName: string | undefined
  setUserName: (name: string | undefined) => void
  coverageArea: string[]
  setCoverageArea: (area: string[]) => void
  progress: boolean
  setProgress: (progress: boolean) => void
}
