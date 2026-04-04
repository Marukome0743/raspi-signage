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

- Authentication and session management (Supabase Auth)
- Server-side rendering and data handling (Next.js App Router)
- Database access and Row Level Security (Supabase / PostgreSQL)
- Environment variable and secret management
- Input validation and sanitization
- Dependency vulnerabilities

### Out of scope

- Issues in third-party services (e.g., Supabase hosted platform) that are not caused by this project's code
- Denial of service attacks against development environments
- Social engineering

## Security Best Practices for Contributors

- Never commit `.env` files or secret keys to the repository
- Use `src/supabase/server.ts` for server-side access and `src/supabase/client.ts` for client-side access
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client — use only on the server
- Replace personally identifiable information (PII) with generic placeholders in code examples
