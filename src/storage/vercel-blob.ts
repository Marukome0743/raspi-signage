import { list as blobList, put as blobPut } from "@vercel/blob"
import type { StorageDriver, StorageObject } from "./types"

export class VercelBlobStorage implements StorageDriver {
  async upload(
    prefix: string,
    fileName: string,
    body: File | Blob | ArrayBuffer | Uint8Array,
    contentType?: string,
  ): Promise<StorageObject> {
    const key = `${prefix}/${fileName}`
    const result = await blobPut(key, body as Blob, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    })
    return { key, url: result.url }
  }

  async list(prefix: string): Promise<StorageObject[]> {
    const result = await blobList({ prefix: `${prefix}/` })
    return result.blobs.map((blob) => ({
      key: blob.pathname,
      url: blob.url,
    }))
  }
}
