-- ─── Auth migration: NextAuth models + API keys ───────────────────────────────

-- Add NextAuth fields to users table
ALTER TABLE "users" ADD COLUMN "name"          TEXT;
ALTER TABLE "users" ADD COLUMN "emailVerified" TIMESTAMPTZ(6);
ALTER TABLE "users" ADD COLUMN "image"         TEXT;

-- Set column defaults so the NextAuth Prisma adapter can create OAuth users
-- without requiring the caller to supply role/region explicitly.
ALTER TABLE "users" ALTER COLUMN "role"   SET DEFAULT 'stakeholder';
ALTER TABLE "users" ALTER COLUMN "region" SET DEFAULT 'UK';

-- ─── accounts (OAuth account linking) ────────────────────────────────────────

CREATE TABLE "accounts" (
    "id"                UUID    NOT NULL DEFAULT gen_random_uuid(),
    "userId"            UUID    NOT NULL,
    "type"              TEXT    NOT NULL,
    "provider"          TEXT    NOT NULL,
    "providerAccountId" TEXT    NOT NULL,
    "refresh_token"     TEXT,
    "access_token"      TEXT,
    "expires_at"        INTEGER,
    "token_type"        TEXT,
    "scope"             TEXT,
    "id_token"          TEXT,
    "session_state"     TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "accounts_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "accounts_provider_providerAccountId_key"
        UNIQUE ("provider", "providerAccountId")
);

CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- ─── verification_tokens (email verification) ────────────────────────────────

CREATE TABLE "verification_tokens" (
    "identifier" TEXT        NOT NULL,
    "token"      TEXT        NOT NULL,
    "expires"    TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "verification_tokens_token_key"              UNIQUE ("token"),
    CONSTRAINT "verification_tokens_identifier_token_key"   UNIQUE ("identifier", "token")
);

-- ─── api_keys (supplier integrations) ────────────────────────────────────────

CREATE TABLE "api_keys" (
    "id"         UUID           NOT NULL DEFAULT gen_random_uuid(),
    "userId"     UUID           NOT NULL,
    "keyHash"    TEXT           NOT NULL,
    "prefix"     TEXT           NOT NULL,
    "name"       TEXT           NOT NULL,
    "createdAt"  TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt"  TIMESTAMPTZ(6),
    "lastUsedAt" TIMESTAMPTZ(6),
    "revokedAt"  TIMESTAMPTZ(6),

    CONSTRAINT "api_keys_pkey"         PRIMARY KEY ("id"),
    CONSTRAINT "api_keys_keyHash_key"  UNIQUE ("keyHash"),
    CONSTRAINT "api_keys_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "api_keys_userId_idx"  ON "api_keys"("userId");
CREATE INDEX "api_keys_keyHash_idx" ON "api_keys"("keyHash");
