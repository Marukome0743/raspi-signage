export interface StorageObject {
  key: string
  url: string
}

export interface StorageDriver {
  /**
   * Upload a file under `prefix/fileName` and return its public URL.
   * Existing objects with the same key are overwritten.
   */
  upload(
    prefix: string,
    fileName: string,
    body: File | Blob | ArrayBuffer | Uint8Array,
    contentType?: string,
  ): Promise<StorageObject>

  /** List public URLs of all objects under a given prefix. */
  list(prefix: string): Promise<StorageObject[]>
}
