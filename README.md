# raspi-signage

Digital signage system with Raspberry Pi

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
mise run supabase:env
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

Seed data includes 2 areas (関東, 関西) with corresponding orders and pixel size settings.

### 4. Install dependencies and start dev server

```bash
bun install
bun dev
```

Open <http://localhost:3000/dashboard/login> to access the dashboard.

## Stopping Supabase

```bash
supabase stop
```
