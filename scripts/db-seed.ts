import { Pool } from "pg"
import { getAuth } from "../src/auth/server"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const pool = new Pool({ connectionString })

interface SeedAccount {
  email: string
  password: string
  name: string
  management: boolean
  coverageArea: string[]
}

const ACCOUNTS: SeedAccount[] = [
  {
    email: "admin@example.com",
    password: "password123",
    name: "管理者",
    management: true,
    coverageArea: ["0", "1", "2", "3", "4", "5", "6", "7"],
  },
  {
    email: "user@example.com",
    password: "password123",
    name: "一般ユーザー",
    management: false,
    coverageArea: ["0"],
  },
]

const ORDERS: { id: string; set1: unknown[] }[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    set1: [
      {
        fileName: "logo.png",
        path: "https://www.openupgroup.co.jp/_assets/images/common/logo.png",
        type: "image",
        viewTime: 10000,
      },
      {
        fileName: "ogp.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/common/ogp.jpg",
        type: "image",
        viewTime: 10000,
      },
    ],
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    set1: [
      {
        fileName: "purpose_index01.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index01_1.jpg",
        type: "image",
        viewTime: 10000,
      },
      {
        fileName: "purpose_index02.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index02.jpg",
        type: "image",
        viewTime: 10000,
      },
    ],
  },
  {
    id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
    set1: [
      {
        fileName: "purpose_index03.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index03.jpg",
        type: "image",
        viewTime: 10000,
      },
    ],
  },
  {
    id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    set1: [
      {
        fileName: "purpose_index04.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index04.jpg",
        type: "image",
        viewTime: 10000,
      },
    ],
  },
  {
    id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
    set1: [
      {
        fileName: "purpose_index05.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index05.jpg",
        type: "image",
        viewTime: 10000,
      },
    ],
  },
  {
    id: "11111111-aaaa-bbbb-cccc-111111111111",
    set1: [
      {
        fileName: "purpose_index06.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/RN/purpose/our-purpose/purpose_index06.jpg",
        type: "image",
        viewTime: 10000,
      },
    ],
  },
  {
    id: "22222222-aaaa-bbbb-cccc-222222222222",
    set1: [
      {
        fileName: "service_rn.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/RN/top/service_rn.jpg",
        type: "image",
        viewTime: 10000,
      },
    ],
  },
  {
    id: "33333333-aaaa-bbbb-cccc-333333333333",
    set1: [
      {
        fileName: "sustainability.jpg",
        path: "https://www.openupgroup.co.jp/_assets/images/RN/top/sustainability.jpg",
        type: "image",
        viewTime: 10000,
      },
    ],
  },
]

const PIXEL_SIZE_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc"

const AREAS: { areaId: string; areaName: string; orderId: string }[] = [
  { areaId: "0", areaName: "関東", orderId: ORDERS[0].id },
  { areaId: "1", areaName: "関西", orderId: ORDERS[1].id },
  { areaId: "2", areaName: "北海道", orderId: ORDERS[2].id },
  { areaId: "3", areaName: "東北", orderId: ORDERS[3].id },
  { areaId: "4", areaName: "中部", orderId: ORDERS[4].id },
  { areaId: "5", areaName: "中国", orderId: ORDERS[5].id },
  { areaId: "6", areaName: "四国", orderId: ORDERS[6].id },
  { areaId: "7", areaName: "九州", orderId: ORDERS[7].id },
]

async function truncateAll() {
  await pool.query(`
    TRUNCATE TABLE contents, pixel_sizes, orders,
                   "session", "account", "verification", "user"
    RESTART IDENTITY CASCADE
  `)
}

async function seedAccounts() {
  const auth = getAuth()
  for (const account of ACCOUNTS) {
    const result = await auth.api.signUpEmail({
      body: {
        email: account.email,
        password: account.password,
        name: account.name,
      },
    })
    const uid = result.user.id
    await pool.query(
      `UPDATE "user"
          SET management = $1,
              coverage_area = $2,
              pass_flg = false,
              deleted = false
        WHERE id = $3`,
      [account.management, account.coverageArea, uid],
    )
    console.log(`  user: ${account.email} (${uid})`)
  }
}

async function seedSignage() {
  for (const order of ORDERS) {
    await pool.query(
      `INSERT INTO orders (id, set1, hidden) VALUES ($1, $2::jsonb, '[]'::jsonb)`,
      [order.id, JSON.stringify(order.set1)],
    )
  }
  await pool.query(
    `INSERT INTO pixel_sizes
            (id, width, height, pixel_width, pixel_height,
             margin_top, margin_left, display_content_flg, get_pixel_flg)
            VALUES ($1, 1920, 1080, 1920, 1080, 0, 0, true, false)`,
    [PIXEL_SIZE_ID],
  )
  for (const area of AREAS) {
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
  console.log("👤 seeding accounts via Better Auth")
  await seedAccounts()
  console.log("🖼️ seeding orders / pixel_sizes / contents")
  await seedSignage()
  console.log("✅ seed complete")
} catch (e) {
  console.error("❌ seed failed:", e)
  process.exitCode = 1
} finally {
  await pool.end()
}
