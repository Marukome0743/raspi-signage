// Production seed: admin user via Better Auth, downloads source images and
// re-uploads them to Vercel Blob, then inserts orders / pixel_sizes / contents.
//
// Required env:
//   DATABASE_URL              Neon Postgres connection string
//   STORAGE_PROVIDER=vercel-blob
//   BLOB_READ_WRITE_TOKEN     Vercel Blob read/write token
//   BETTER_AUTH_SECRET        Production auth secret
//   BETTER_AUTH_URL           Production app URL
//   SEED_ADMIN_EMAIL          Admin email (e.g. admin@example.com)
//   SEED_ADMIN_PASSWORD       Admin password
//   SEED_ADMIN_NAME           Admin display name
//
// Run: bun --env-file=.env.production.local scripts/db-seed-prod.ts

import { Pool } from "pg"
import { getAuth } from "../src/auth/server"
import { getStorage } from "../src/storage"

const REQUIRED = [
  "DATABASE_URL",
  "BLOB_READ_WRITE_TOKEN",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "SEED_ADMIN_EMAIL",
  "SEED_ADMIN_PASSWORD",
  "SEED_ADMIN_NAME",
] as const
for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`${key} is not set`)
    process.exit(1)
  }
}
if (process.env.STORAGE_PROVIDER !== "vercel-blob") {
  console.error("STORAGE_PROVIDER must be 'vercel-blob' for production seed")
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

interface SourceImage {
  fileName: string
  sourceUrl: string
  type: "image"
  viewTime: number
}

interface AreaPlan {
  areaId: string
  areaName: string
  orderId: string
  images: SourceImage[]
}

const PIXEL_SIZE_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc"

const OP = "https://www.openupgroup.co.jp/_assets/images"

function img(fileName: string, sourceUrl: string) {
  return { fileName, sourceUrl, type: "image" as const, viewTime: 10000 }
}

const PLAN: AreaPlan[] = [
  {
    areaId: "0",
    areaName: "関東",
    orderId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    images: [
      img("btnpurpose01.jpg", `${OP}/RN/top/btnpurpose01.jpg`),
      img("purpose_rn.jpg", `${OP}/RN/top/purpose_rn.jpg`),
    ],
  },
  {
    areaId: "1",
    areaName: "関西",
    orderId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    images: [
      img("btnpurpose02.jpg", `${OP}/RN/top/btnpurpose02.jpg`),
      img("service_rn.jpg", `${OP}/RN/top/service_rn.jpg`),
    ],
  },
  {
    areaId: "2",
    areaName: "北海道",
    orderId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    images: [
      img("btnpurpose03.jpg", `${OP}/RN/top/btnpurpose03.jpg`),
      img("sustainability.jpg", `${OP}/RN/top/sustainability.jpg`),
    ],
  },
  {
    areaId: "3",
    areaName: "東北",
    orderId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    images: [
      img("case001_img04.png", `${OP}/RN/case/001/img04.png`),
      img("case002_img02.jpg", `${OP}/RN/case/002/img02.jpg`),
    ],
  },
  {
    areaId: "4",
    areaName: "中部",
    orderId: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    images: [
      img("case004_img01.jpg", `${OP}/RN/case/004/img01.jpg`),
      img("case005_img01.jpg", `${OP}/RN/case/005/img01.jpg`),
    ],
  },
  {
    areaId: "5",
    areaName: "中国",
    orderId: "11111111-aaaa-bbbb-cccc-111111111111",
    images: [
      img("case006_img05.jpg", `${OP}/RN/case/006/img05.jpg`),
      img("case007_img02.jpg", `${OP}/RN/case/007/img02.jpg`),
    ],
  },
  {
    areaId: "6",
    areaName: "四国",
    orderId: "22222222-aaaa-bbbb-cccc-222222222222",
    images: [
      img("abroad_grp_tb.jpg", `${OP}/RN/service/abroad/grp_tb.jpg`),
      img("abroad_grp_td.jpg", `${OP}/RN/service/abroad/grp_td.jpg`),
    ],
  },
  {
    areaId: "7",
    areaName: "九州",
    orderId: "33333333-aaaa-bbbb-cccc-333333333333",
    images: [
      img(
        "sustainability_visual_01.jpg",
        `${OP}/RN/sustainability/img_visual_01.jpg`,
      ),
      img("img_ogp_01.jpg", `${OP}/common/img_ogp_01.jpg`),
    ],
  },
]

async function truncateAll() {
  await pool.query(`
    TRUNCATE TABLE contents, pixel_sizes, orders,
                   "session", "account", "verification", "user"
    RESTART IDENTITY CASCADE
  `)
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const name = process.env.SEED_ADMIN_NAME
  if (!email || !password || !name) {
    throw new Error(
      "SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME must be set",
    )
  }

  const auth = getAuth()
  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  })
  const uid = result.user.id
  await pool.query(
    `UPDATE "user"
        SET management = true,
            coverage_area = $1,
            pass_flg = false,
            deleted = false
      WHERE id = $2`,
    [["0", "1", "2", "3", "4", "5", "6", "7"], uid],
  )
  console.log(`  admin: ${process.env.SEED_ADMIN_EMAIL} (${uid})`)
}

async function uploadAreaImages(plan: AreaPlan) {
  const storage = getStorage()
  const set1: {
    fileName: string
    path: string
    type: "image"
    viewTime: number
  }[] = []
  for (const img of plan.images) {
    const res = await fetch(img.sourceUrl)
    if (!res.ok) {
      throw new Error(
        `failed to fetch ${img.sourceUrl}: ${res.status} ${res.statusText}`,
      )
    }
    const buf = await res.arrayBuffer()
    const contentType = res.headers.get("content-type") ?? undefined
    const obj = await storage.upload(
      plan.areaId,
      img.fileName,
      buf,
      contentType,
    )
    console.log(`    ⇡ ${plan.areaId}/${img.fileName} → ${obj.url}`)
    set1.push({
      fileName: img.fileName,
      path: obj.url,
      type: img.type,
      viewTime: img.viewTime,
    })
  }
  return set1
}

async function seedSignage() {
  for (const area of PLAN) {
    console.log(`📦 area ${area.areaId} (${area.areaName})`)
    const set1 = await uploadAreaImages(area)
    await pool.query(
      `INSERT INTO orders (id, set1, hidden) VALUES ($1, $2::jsonb, '[]'::jsonb)`,
      [area.orderId, JSON.stringify(set1)],
    )
  }
  await pool.query(
    `INSERT INTO pixel_sizes
            (id, width, height, pixel_width, pixel_height,
             margin_top, margin_left, display_content_flg, get_pixel_flg)
            VALUES ($1, 1920, 1080, 1920, 1080, 0, 0, true, false)`,
    [PIXEL_SIZE_ID],
  )
  for (const area of PLAN) {
    await pool.query(
      `INSERT INTO contents (area_id, area_name, order_id, pixel_size_id, deleted)
              VALUES ($1, $2, $3, $4, false)`,
      [area.areaId, area.areaName, area.orderId, PIXEL_SIZE_ID],
    )
  }
}

try {
  console.log("🧹 truncating tables")
  await truncateAll()
  console.log("👤 seeding admin via Better Auth")
  await seedAdmin()
  console.log("🖼️ uploading images to Vercel Blob & seeding signage")
  await seedSignage()
  console.log("✅ production seed complete")
} catch (e) {
  console.error("❌ seed failed:", e)
  process.exitCode = 1
} finally {
  await pool.end()
}
