# raspi-signage

Digital signage system with Raspberry Pi

## Frontend

This frontend uses [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/).

## Style Guide

Follow [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/blob/master/react/README.md).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Bun](https://bun.sh/)

## Setup

### 1. Start Supabase locally

```bash
supabase start
```

This starts all Supabase services via Docker. After startup, the CLI outputs the local API URL and keys.

- Studio: http://localhost:54323
- API URL: http://127.0.0.1:54321

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

The default values in `.env.local.example` match the local Supabase instance. No changes needed for local development.

### 3. Seed the database

```bash
supabase db reset
```

This runs migrations and seeds the database with initial data:

| Account | Email | Password | Role |
|---|---|---|---|
| Admin | admin@example.com | password123 | 管理者 |
| User | user@example.com | password123 | 一般ユーザー |

Seed data includes 2 areas (関東, 関西) with corresponding orders and pixel size settings.

### 4. Install dependencies and start dev server

```bash
bun install
bun dev
```

Open http://localhost:3000/dashboard/Login to access the dashboard.

## Stopping Supabase

```bash
supabase stop
```
