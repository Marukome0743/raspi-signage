# AGENTS.md

## Project overview

Digital signage system for Raspberry Pi. Built with Next.js 16 (App Router) + TypeScript + Supabase.

## Tech stack

- Runtime: Bun
- Framework: Next.js 16 (App Router)
- Language: TypeScript (strict mode)
- UI: MUI (Material UI) + Emotion
- Backend: Supabase (Auth, Database)
- Linter/Formatter: Biome
- Testing: Bun test (unit), Playwright (E2E)
- Task runner: mise

## Setup commands

```bash
mise install              # Install tools (bun, supabase, etc.)
supabase start            # Start local Supabase
mise run supabase:env     # Generate .env from Supabase
supabase db reset         # Run migrations + seed data
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
  dashboard/              # Admin dashboard (Login, ManageContents, ViewPosition, etc.)
  page.tsx                # Signage display page
components/dashboard/     # Dashboard React components
utilities/                # Data fetching and manipulation utilities
src/supabase/             # Supabase clients (client.ts, server.ts, database.types.ts)
supabase/                 # Supabase config, migrations, and seeds
test/                     # Tests (unit/, e2e/)
```

## Security

- Never hardcode secret keys or API keys in source code
- Replace PII (personally identifiable information) with placeholders
- See `SECURITY.md` for details

## Conventions

- Use function components
- Use `src/supabase/client.ts` for client-side and `src/supabase/server.ts` for server-side Supabase clients
- Run `bun run lint` before committing
