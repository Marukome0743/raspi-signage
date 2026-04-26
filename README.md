<div align="center">
  <h1>raspi-signage</h1>

  <a href="https://www.raspberrypi.com/"><img src="https://img.shields.io/badge/raspberry%20pi-A22846?labelColor=000000&logo=raspberrypi&style=for-the-badge" alt="Raspberry Pi" /></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/bun-FBF0DF?labelColor=000000&logo=bun&style=for-the-badge" alt="Bun" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/docker-2496ED?labelColor=000000&logo=docker&style=for-the-badge" alt="Docker" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/next.js-000000?labelColor=000000&logo=nextdotjs&style=for-the-badge" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/react-61DAFB?labelColor=000000&logo=react&style=for-the-badge" alt="React" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?labelColor=000000&logo=typescript&style=for-the-badge" alt="TypeScript" /></a>
  <a href="https://mui.com/"><img src="https://img.shields.io/badge/mui-007FFF?labelColor=000000&logo=mui&style=for-the-badge" alt="MUI" /></a>
  <a href="https://emotion.sh/"><img src="https://img.shields.io/badge/emotion-D26AC2?labelColor=000000&logo=emotion&style=for-the-badge" alt="Emotion" /></a>
  <a href="https://www.better-auth.com/"><img src="https://img.shields.io/badge/better%20auth-1E1E2E?labelColor=000000&logo=auth0&style=for-the-badge" alt="Better Auth" /></a>
  <a href="https://neon.tech/"><img src="https://img.shields.io/badge/neon-00E599?labelColor=000000&logo=postgresql&logoColor=white&style=for-the-badge" alt="Neon" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/postgres-4169E1?labelColor=000000&logo=postgresql&logoColor=white&style=for-the-badge" alt="Postgres" /></a>
  <a href="https://vercel.com/docs/storage/vercel-blob"><img src="https://img.shields.io/badge/vercel%20blob-000000?labelColor=000000&logo=vercel&style=for-the-badge" alt="Vercel Blob" /></a>
  <a href="https://rustfs.com/"><img src="https://img.shields.io/badge/rustfs-CE412B?labelColor=000000&logo=rust&style=for-the-badge" alt="RustFS" /></a>
  <a href="https://biomejs.dev/"><img src="https://img.shields.io/badge/biome-60A5FA?labelColor=000000&logo=biome&style=for-the-badge" alt="Biome" /></a>
  <a href="https://playwright.dev/"><img src="https://img.shields.io/badge/playwright-2EAD33?labelColor=000000&logo=playwright&style=for-the-badge" alt="Playwright" /></a>
  <a href="https://mise.jdx.dev/"><img src="https://img.shields.io/badge/mise-FA8072?labelColor=000000&logo=mise&style=for-the-badge" alt="mise" /></a>

  <p>
    Digital signage system for Raspberry Pi
  </p>
</div>

## Architecture

| Concern | Production | Local development |
| --- | --- | --- |
| Database | [Neon](https://neon.tech/) (Postgres) | [Postgres](https://www.postgresql.org/) via Docker |
| Authentication | [Better Auth](https://www.better-auth.com/) (email + password) | Better Auth against local Postgres |
| Image / video storage | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) | [RustFS](https://rustfs.com/) (S3-compatible) via Docker |
| Hosting | [Vercel](https://vercel.com/) | `bun dev` |

The app talks to the database and storage exclusively through Server Actions
(`src/services/*.ts` files marked with `"use server"`), so the browser bundle
contains no database driver or S3 client. Better Auth's REST endpoints are
mounted at `/api/auth/[...all]`.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [mise](https://mise.jdx.dev/)

## Setup

### 1. Install tools and start local services

```bash
mise install
mise run local:up
```

`local:up` starts a Postgres container on `localhost:54322` and a RustFS
(S3-compatible) container on `localhost:9000` (console: `localhost:9001`).

### 2. Configure environment variables

```bash
mise run local:env
```

This writes the local development values into `.env`:

| Variable | Local default |
| --- | --- |
| `DATABASE_URL` | `postgres://raspi:raspi@127.0.0.1:54322/raspi_signage` |
| `BETTER_AUTH_SECRET` | development placeholder |
| `BETTER_AUTH_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `STORAGE_PROVIDER` | `s3` (use `vercel-blob` in production) |
| `S3_ENDPOINT` | `http://127.0.0.1:9000` |
| `S3_BUCKET` | `signage-contents` |
| `S3_PUBLIC_BASE_URL` | `http://127.0.0.1:9000/signage-contents` |

> **Note:** `.env` is included in `.gitignore`. Do not commit secrets.

In production, set `DATABASE_URL` to your Neon connection string,
`STORAGE_PROVIDER=vercel-blob`, and provide `BLOB_READ_WRITE_TOKEN` from the
Vercel Blob integration.

### 3. Apply the schema and seed data

```bash
mise run db:reset
```

This applies `src/db/schema.sql` to Postgres, ensures the RustFS bucket
exists with a public-read policy, and seeds:

| Account | Email | Password | Role |
| --- | --- | --- | --- |
| Admin | <admin@example.com> | password123 | Admin |
| User | <user@example.com> | password123 | General User |

Seed data includes 8 areas (関東, 関西, 北海道, 東北, 中部, 中国, 四国, 九州)
populated with public images from the Open Up Group corporate site so the
signage display has something to render out of the box.

### 4. Install dependencies and start dev server

```bash
bun install
bun dev
```

Open <http://localhost:3000/dashboard/login> to access the dashboard.

## Pages

| URL | Description |
| --- | --- |
| `/` | Signage display (specify area with `?areaId=`) |
| `/dashboard/login` | Login |
| `/dashboard` | Dashboard (top page) |
| `/dashboard/manage-contents` | Content management |
| `/dashboard/view-position` | Display position adjustment |
| `/dashboard/area-management` | Area management |
| `/dashboard/user-account-management` | User account management |
| `/dashboard/account-setting-management` | Account settings |
| `/dashboard/password-reset` | Password reset |

## Common tasks

```bash
mise run local:up      # start Postgres + RustFS containers
mise run local:down    # stop containers (data persists in volumes)
mise run local:env     # regenerate .env with local defaults
mise run db:migrate    # apply src/db/schema.sql
mise run db:seed       # truncate + reseed via Better Auth
mise run db:reset      # migrate + ensure bucket + seed
bun run test:unit      # bun test (happy-dom)
bun run test:e2e       # Playwright E2E
bun run lint           # Biome
```
