"use server"

import { queryOne } from "@/src/db/client"
import type { ContentItem, Order } from "@/src/db/types"
import { getStorage } from "@/src/storage"
import { updateContentOrder } from "./contents"

// Upload content (image / video) and append it to the order's hidden list.
// Storage backend is Vercel Blob in production and S3-compatible (RustFS)
// for local development.
export async function postContent(
  docId: string,
  content: File,
  type: ContentItem["type"],
  duration: number,
): Promise<void> {
  if (!content.name) {
    return
  }

  const contentsRow = await queryOne<{ area_id: string }>(
    `SELECT area_id
       FROM contents
      WHERE deleted = false AND order_id = $1
      LIMIT 1`,
    [docId],
  )
  if (!contentsRow) {
    return
  }

  const areaId = contentsRow.area_id
  let publicUrl: string
  try {
    const storage = getStorage()
    const result = await storage.upload(
      areaId,
      content.name,
      content,
      content.type || undefined,
    )
    publicUrl = result.url
  } catch (e) {
    console.log("Upload error:", e)
    return
  }

  let viewTime = 2000
  if (duration !== 0) {
    viewTime = duration
  }

  const order = await queryOne<Order>(
    `SELECT id, set1, hidden FROM orders WHERE id = $1`,
    [docId],
  )

  const currentHidden = order?.hidden ?? []
  await updateContentOrder(docId, {
    hidden: [
      ...currentHidden,
      {
        fileName: content.name,
        path: publicUrl,
        type,
        viewTime,
      },
    ],
  })
}
