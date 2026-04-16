<div align="center">
  <h1>robopo</h1>

  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/bun-FBF0DF?labelColor=000000&logo=bun&style=for-the-badge" alt="Bun" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/docker-2496ED?labelColor=000000&logo=docker&style=for-the-badge" alt="Docker" /></a>
  <a href="https://mui.com/"><img src="https://img.shields.io/badge/mui-007FFF?labelColor=000000&logo=mui&style=for-the-badge" alt="MUI" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/next.js-000000?labelColor=000000&logo=nextdotjs&style=for-the-badge" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/react-61DAFB?labelColor=000000&logo=react&style=for-the-badge" alt="React" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/supabase-3FCF8E?labelColor=000000&logo=supabase&style=for-the-badge" alt="Supabase" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?labelColor=000000&logo=typescript&style=for-the-badge" alt="TypeScript" /></a>
  <a href="https://biomejs.dev/"><img src="https://img.shields.io/badge/biome-60A5FA?labelColor=000000&logo=biome&style=for-the-badge" alt="Biome" /></a>

  <p>
    Scoring and Calculation Application for Robosava
  </p>
</div>

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [mise](https://mise.jdx.dev/)

## Setup

### 1. Install tools and start Supabase locally

```bash
mise install
supabase start
```

This starts all Supabase services via Docker. After startup, the CLI outputs the local API URL and keys.

- Studio: <http://localhost:54323>
- API URL: <http://127.0.0.1:54321>

### 2. Configure environment variables

Generate a `.env` file from the running Supabase instance:

```bash
mise supabase:env
```

This writes `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env` automatically.

> **Note:** `.env` is included in `.gitignore`. Do not commit secrets to the repository.

### 3. Seed the database

```bash
supabase db reset
```

This runs migrations and seeds the database with initial data:

| Account | Email | Password | Role |
| --- | --- | --- | --- |
| Admin | <admin@example.com> | password123 | Admin |
| User | <user@example.com> | password123 | General User |

Seed data includes 8 areas (関東, 関西, 北海道, 東北, 中部, 中国, 四国, 九州) with corresponding orders and pixel size settings.

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

## Stopping Supabase

```bash
supabase stop
```
