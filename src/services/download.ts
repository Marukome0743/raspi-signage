"use server"

import { getStorage } from "@/src/storage"

export async function downLoadURLList({
  areaId,
}: {
  areaId: string
}): Promise<string[]> {
  try {
    const storage = getStorage()
    const objects = await storage.list(areaId)
    return objects.map((obj) => obj.url)
  } catch {
    return []
  }
}
