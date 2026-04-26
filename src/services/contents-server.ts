"use server"

// Server-side wrappers for content services. With direct pg access, the
// server and client variants share the same implementation; these thin
// async wrappers exist so existing Server Components can keep importing
// `contents-server` symbols.

import type { Content, ContentListItem, Order } from "@/src/db/types"
import { getContentList, getContentsDataClient, getOrderById } from "./contents"

export async function getContentsDataServer(): Promise<Content[]> {
  return getContentsDataClient()
}

export async function getContentListServer(
  coverageAreaList: string[],
): Promise<ContentListItem[]> {
  return getContentList(coverageAreaList)
}

export async function getOrderByIdServer(
  orderId: string,
): Promise<Order | null> {
  return getOrderById(orderId)
}
