# raspi-signage

Digital signage system with Raspberry Pi

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

- Studio: <http://localhost:54323>
- API URL: <http://127.0.0.1:54321>

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
touch .env
```

Set the following environment variables. The values below are defaults for the local Supabase instance.

| Variable | Description | Local default |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `anon key` from `supabase start` output |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `service_role key` from `supabase start` output |

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

Open <http://localhost:3000/dashboard/Login> to access the dashboard.

## Stopping Supabase

```bash
supabase stop
```
