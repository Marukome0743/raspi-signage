-- raspi-signage database schema
-- Postgres (Neon for production, plain Postgres for local development)
-- Better Auth tables ("user", "session", "account", "verification") plus app tables.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- Better Auth managed tables
-- =========================

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- raspi-signage application fields
  management BOOLEAN NOT NULL DEFAULT false,
  coverage_area TEXT[] NOT NULL DEFAULT '{}',
  pass_flg BOOLEAN NOT NULL DEFAULT false,
  deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Better Auth 1.7.0 through 1.7.2 required an "issuer" column on "account" and
-- a unique index over ("issuer", "accountId"). 1.7.3 reverted to the 1.6 schema:
-- an account is identified by "providerId" and "accountId" alone, and Better
-- Auth never writes "issuer" again. Its schema check rejects a required column
-- it cannot fill, so every insert into "account" fails while the column stays
-- NOT NULL. Relax it on databases provisioned by those releases; the column
-- keeps its rows and fresh databases never get it in the first place.
-- https://www.better-auth.com/docs/guides/1-7-upgrade-guide
DROP INDEX IF EXISTS "account_issuer_accountId_uidx";
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = CURRENT_SCHEMA() AND table_name = 'account'
      AND column_name = 'issuer'
  ) THEN
    EXECUTE 'ALTER TABLE "account" ALTER COLUMN issuer DROP NOT NULL';
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- Application tables
-- =========================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set1 JSONB NOT NULL DEFAULT '[]'::jsonb,
  hidden JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS pixel_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  width INTEGER NOT NULL DEFAULT 0,
  height INTEGER NOT NULL DEFAULT 0,
  pixel_width INTEGER NOT NULL DEFAULT 0,
  pixel_height INTEGER NOT NULL DEFAULT 0,
  margin_top INTEGER NOT NULL DEFAULT 0,
  margin_left INTEGER NOT NULL DEFAULT 0,
  display_content_flg BOOLEAN NOT NULL DEFAULT true,
  get_pixel_flg BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  pixel_size_id UUID REFERENCES pixel_sizes(id),
  deleted BOOLEAN NOT NULL DEFAULT false
);
