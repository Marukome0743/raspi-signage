# AGENTS.md

## Project overview

Digital signage system for Raspberry Pi. Built with Next.js 16 (App Router) + TypeScript, hosted on Vercel.

## Tech stack

- Runtime: Bun
- Framework: Next.js 16 (App Router, Server Actions)
- Language: TypeScript (strict mode)
- UI: MUI (Material UI) + Emotion
- Authentication: Better Auth (email + password)
- Database: Neon (Postgres) in production, plain Postgres locally — accessed via `pg`
- Storage: Vercel Blob in production, RustFS (S3-compatible) locally — accessed via `@aws-sdk/client-s3`
- Linter / Formatter: Biome
- Testing: Bun test (unit), Playwright (E2E)
- Task runner: mise
- Local services: docker-compose (postgres + rustfs)

## Setup commands

```bash
mise install              # Install tools (bun etc.)
mise run local:up         # Start local Postgres + RustFS via docker compose
mise run local:env        # Generate .env for local development
mise run db:reset         # Apply schema + ensure bucket + seed via Better Auth
bun install
bun dev                   # http://localhost:3000
```

## Testing

```bash
bun run test:unit         # Unit tests (happy-dom)
bun run test:e2e          # E2E tests (Playwright)
```

- Test files are located in `test/unit/` and `test/e2e/`
- Do not add or modify tests unless explicitly requested

## Code style

- Linting and formatting managed by Biome
- No semicolons, space indentation
- Unused imports are errors (`noUnusedImports: "error"`)
- `useBlockStatements: "error"` — block statements are required
- Path alias: `@/*` → project root

```bash
bun run lint              # Lint check
bun run lint:fix          # Auto-fix
bun run format            # Format
```

## Project structure

```bash
app/                      # Next.js App Router pages
  api/auth/[...all]/      # Better Auth REST handler
  dashboard/              # Admin dashboard
  page.tsx                # Signage display page
components/dashboard/     # Dashboard React components
src/auth/                 # Better Auth server config + browser client
src/db/                   # pg Pool, schema.sql, domain types
src/storage/              # Storage abstraction + Vercel Blob / S3 adapters
src/services/             # Server Actions + pure helpers (content-helpers.ts)
scripts/                  # db-bootstrap, db-migrate, db-seed, local-env
docker-compose.yml        # Local Postgres + RustFS
test/                     # Tests (unit/, e2e/)
```

## Conventions

- Use function components.
- All database / storage access lives in `"use server"` files under
  `src/services/`. Client components import them as Server Actions.
- Pure helpers (no DB / storage access) live in `src/services/content-helpers.ts`.
- Better Auth client (`signIn`, `signOut`, `signUp`, `changePassword`) is
  used directly in client pages; server-side session checks use
  `getAuth().api.getSession({ headers })` from `src/auth/server.ts`.
- Run `bun run lint` before committing.

## Security

- Never hardcode secret keys or API keys in source code.
- `BETTER_AUTH_SECRET`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, and
  `S3_*` credentials must come from environment variables.
- Replace PII with placeholders. See `SECURITY.md`.
