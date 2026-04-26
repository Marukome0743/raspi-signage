# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in raspi-signage, please report it responsibly via [GitHub Security Advisories](https://github.com/OpenUp-LabTakizawa/raspi-signage/security/advisories/new).

Please do not open a public issue for security vulnerabilities.

### What to include

- A description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Any potential impact

### Response timeline

- We will acknowledge your report within 7 days.
- We aim to provide a fix or mitigation plan within 30 days, depending on severity.
- You will be notified when the issue is resolved.

### Scope

The following areas are in scope for security reports:

- Authentication and session management (Better Auth)
- Server-side rendering and Server Actions (Next.js App Router)
- Database access (Neon / Postgres) — query construction, parameter binding, and access control
- Object storage access (Vercel Blob / RustFS) — public URL exposure and upload validation
- Environment variable and secret management
- Input validation and sanitization
- Dependency vulnerabilities

### Out of scope

- Issues in third-party services (e.g., Vercel, Neon, RustFS) that are not caused by this project's code
- Denial of service attacks against development environments
- Social engineering

## Security Best Practices for Contributors

- Never commit `.env` files or secret keys to the repository.
- All database and storage access lives in `"use server"` files under
  `src/services/`; never import `pg`, `@vercel/blob`, or `@aws-sdk/client-s3`
  from client components.
- Treat the following as secrets and provide them through environment variables:
  - `DATABASE_URL` (Neon connection string in production)
  - `BETTER_AUTH_SECRET` (must be a random 32+ byte secret in production)
  - `BLOB_READ_WRITE_TOKEN` (Vercel Blob)
  - `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` (any non-Vercel storage)
- Replace personally identifiable information (PII) with generic placeholders
  in code examples and seed data.
- Always parameterize SQL via `query` / `queryOne` / `queryRows` from
  `src/db/client.ts`. Never build SQL by string concatenation with
  user-supplied values.
