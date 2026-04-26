import {
  CreateBucketCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import type { StorageDriver, StorageObject } from "./types"

interface S3Options {
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicBaseUrl?: string
  forcePathStyle?: boolean
}

export class S3Storage implements StorageDriver {
  private readonly client: S3Client
  private readonly bucket: string
  private readonly endpoint: string
  private readonly publicBaseUrl: string
  private readonly forcePathStyle: boolean

  constructor(options: S3Options) {
    this.bucket = options.bucket
    this.endpoint = options.endpoint
    this.forcePathStyle = options.forcePathStyle ?? true
    this.publicBaseUrl =
      options.publicBaseUrl ??
      (this.forcePathStyle
        ? `${options.endpoint}/${this.bucket}`
        : `${options.endpoint.replace("://", `://${this.bucket}.`)}`)
    this.client = new S3Client({
      endpoint: options.endpoint,
      region: options.region,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
      forcePathStyle: this.forcePathStyle,
    })
  }

  async upload(
    prefix: string,
    fileName: string,
    body: File | Blob | ArrayBuffer | Uint8Array,
    contentType?: string,
  ): Promise<StorageObject> {
    const key = `${prefix}/${fileName}`
    const buffer = await this.toBuffer(body)
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    )
    return { key, url: this.publicUrl(key) }
  }

  async list(prefix: string): Promise<StorageObject[]> {
    const response = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: `${prefix}/`,
      }),
    )
    return (response.Contents ?? [])
      .filter((obj) => !!obj.Key)
      .map((obj) => ({
        key: obj.Key as string,
        url: this.publicUrl(obj.Key as string),
      }))
  }

  /** Idempotent. Creates the bucket and applies a public-read policy. */
  async ensurePublicBucket(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }))
    }
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    }
    await this.client.send(
      new PutBucketPolicyCommand({
        Bucket: this.bucket,
        Policy: JSON.stringify(policy),
      }),
    )
  }

  private publicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`
  }

  private async toBuffer(
    body: File | Blob | ArrayBuffer | Uint8Array,
  ): Promise<Uint8Array> {
    if (body instanceof Uint8Array) {
      return body
    }
    if (body instanceof ArrayBuffer) {
      return new Uint8Array(body)
    }
    return new Uint8Array(await (body as Blob).arrayBuffer())
  }
}
