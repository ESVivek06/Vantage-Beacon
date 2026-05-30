-- Enable pgvector extension (requires Postgres 16 + pgvector installed)
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "UserRole" AS ENUM ('freelancer', 'founder', 'investor', 'supplier', 'stakeholder');
CREATE TYPE "Region" AS ENUM ('UK', 'IN', 'NA');
CREATE TYPE "ConnectionStatus" AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE "ConnectionKind" AS ENUM ('collaboration', 'investment', 'supply', 'mentorship');
CREATE TYPE "ProjectStatus" AS ENUM ('draft', 'open', 'in_progress', 'completed');
CREATE TYPE "InvestmentStage" AS ENUM ('seed', 'pre_series_a', 'series_a', 'growth');
CREATE TYPE "InvestmentStatus" AS ENUM ('interested', 'term_sheet', 'closed', 'declined');

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE "users" (
    "id"           UUID         NOT NULL DEFAULT gen_random_uuid(),
    "email"        TEXT         NOT NULL,
    "passwordHash" TEXT,
    "role"         "UserRole"   NOT NULL,
    "region"       "Region"     NOT NULL,
    "profileData"  JSONB        NOT NULL DEFAULT '{}',
    "createdAt"    TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMPTZ(6) NOT NULL,
    "deletedAt"    TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "profiles" (
    "id"              UUID         NOT NULL DEFAULT gen_random_uuid(),
    "userId"          UUID         NOT NULL,
    "displayName"     TEXT         NOT NULL,
    "bio"             TEXT,
    "skills"          TEXT[]       NOT NULL DEFAULT '{}',
    "tags"            TEXT[]       NOT NULL DEFAULT '{}',
    "embeddingVector" vector(1536),
    "verified"        BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMPTZ(6) NOT NULL,
    "deletedAt"       TIMESTAMPTZ(6),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
    "id"              UUID           NOT NULL DEFAULT gen_random_uuid(),
    "ownerId"         UUID           NOT NULL,
    "title"           TEXT           NOT NULL,
    "description"     TEXT,
    "status"          "ProjectStatus" NOT NULL DEFAULT 'draft',
    "requiredSkills"  TEXT[]         NOT NULL DEFAULT '{}',
    "budget"          JSONB,
    "region"          "Region"       NOT NULL,
    "embeddingVector" vector(1536),
    "createdAt"       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMPTZ(6) NOT NULL,
    "deletedAt"       TIMESTAMPTZ(6),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "connections" (
    "id"          UUID               NOT NULL DEFAULT gen_random_uuid(),
    "requesterId" UUID               NOT NULL,
    "receiverId"  UUID               NOT NULL,
    "status"      "ConnectionStatus" NOT NULL DEFAULT 'pending',
    "kind"        "ConnectionKind"   NOT NULL,
    "createdAt"   TIMESTAMPTZ(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ(6)     NOT NULL,
    "deletedAt"   TIMESTAMPTZ(6),

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "matches" (
    "id"             UUID           NOT NULL DEFAULT gen_random_uuid(),
    "sourceId"       UUID           NOT NULL,
    "targetId"       UUID           NOT NULL,
    "score"          DOUBLE PRECISION NOT NULL,
    "explainability" JSONB          NOT NULL,
    "matchedAt"      TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt"      TIMESTAMPTZ(6),

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "investments" (
    "id"         UUID               NOT NULL DEFAULT gen_random_uuid(),
    "investorId" UUID               NOT NULL,
    "founderId"  UUID               NOT NULL,
    "projectId"  UUID               NOT NULL,
    "stage"      "InvestmentStage"  NOT NULL,
    "amount"     DECIMAL(20, 2),
    "currency"   TEXT               NOT NULL DEFAULT 'GBP',
    "status"     "InvestmentStatus" NOT NULL,
    "createdAt"  TIMESTAMPTZ(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMPTZ(6)     NOT NULL,
    "deletedAt"  TIMESTAMPTZ(6),

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
    "id"         UUID           NOT NULL DEFAULT gen_random_uuid(),
    "senderId"   UUID           NOT NULL,
    "receiverId" UUID           NOT NULL,
    "content"    TEXT           NOT NULL,
    "read"       BOOLEAN        NOT NULL DEFAULT false,
    "sentAt"     TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt"  TIMESTAMPTZ(6),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- ─── Unique Constraints ───────────────────────────────────────────────────────

ALTER TABLE "users"       ADD CONSTRAINT "users_email_key"              UNIQUE ("email");
ALTER TABLE "profiles"    ADD CONSTRAINT "profiles_userId_key"          UNIQUE ("userId");
ALTER TABLE "connections" ADD CONSTRAINT "connections_requesterId_receiverId_key" UNIQUE ("requesterId", "receiverId");

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────

ALTER TABLE "profiles"
    ADD CONSTRAINT "profiles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "projects"
    ADD CONSTRAINT "projects_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "connections"
    ADD CONSTRAINT "connections_requesterId_fkey"
    FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "connections"
    ADD CONSTRAINT "connections_receiverId_fkey"
    FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "investments"
    ADD CONSTRAINT "investments_investorId_fkey"
    FOREIGN KEY ("investorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "investments"
    ADD CONSTRAINT "investments_founderId_fkey"
    FOREIGN KEY ("founderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "investments"
    ADD CONSTRAINT "investments_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "messages"
    ADD CONSTRAINT "messages_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "messages"
    ADD CONSTRAINT "messages_receiverId_fkey"
    FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Standard Indexes ─────────────────────────────────────────────────────────

CREATE INDEX "users_email_idx"      ON "users"("email");
CREATE INDEX "users_role_idx"       ON "users"("role");
CREATE INDEX "users_region_idx"     ON "users"("region");
CREATE INDEX "users_deletedAt_idx"  ON "users"("deletedAt") WHERE "deletedAt" IS NOT NULL;

CREATE INDEX "profiles_userId_idx"    ON "profiles"("userId");
CREATE INDEX "profiles_verified_idx"  ON "profiles"("verified");
CREATE INDEX "profiles_deletedAt_idx" ON "profiles"("deletedAt") WHERE "deletedAt" IS NOT NULL;

CREATE INDEX "projects_ownerId_idx"    ON "projects"("ownerId");
CREATE INDEX "projects_status_idx"     ON "projects"("status");
CREATE INDEX "projects_region_idx"     ON "projects"("region");
CREATE INDEX "projects_deletedAt_idx"  ON "projects"("deletedAt") WHERE "deletedAt" IS NOT NULL;

CREATE INDEX "connections_requesterId_idx" ON "connections"("requesterId");
CREATE INDEX "connections_receiverId_idx"  ON "connections"("receiverId");
CREATE INDEX "connections_status_idx"      ON "connections"("status");
CREATE INDEX "connections_deletedAt_idx"   ON "connections"("deletedAt") WHERE "deletedAt" IS NOT NULL;

CREATE INDEX "matches_sourceId_idx"  ON "matches"("sourceId");
CREATE INDEX "matches_targetId_idx"  ON "matches"("targetId");
CREATE INDEX "matches_score_idx"     ON "matches"("score" DESC);
CREATE INDEX "matches_matchedAt_idx" ON "matches"("matchedAt" DESC);
CREATE INDEX "matches_deletedAt_idx" ON "matches"("deletedAt") WHERE "deletedAt" IS NOT NULL;

CREATE INDEX "investments_investorId_idx" ON "investments"("investorId");
CREATE INDEX "investments_founderId_idx"  ON "investments"("founderId");
CREATE INDEX "investments_projectId_idx"  ON "investments"("projectId");
CREATE INDEX "investments_status_idx"     ON "investments"("status");
CREATE INDEX "investments_deletedAt_idx"  ON "investments"("deletedAt") WHERE "deletedAt" IS NOT NULL;

CREATE INDEX "messages_senderId_idx"           ON "messages"("senderId");
CREATE INDEX "messages_receiverId_read_idx"    ON "messages"("receiverId", "read");
CREATE INDEX "messages_sentAt_idx"             ON "messages"("sentAt" DESC);
CREATE INDEX "messages_deletedAt_idx"          ON "messages"("deletedAt") WHERE "deletedAt" IS NOT NULL;

-- ─── pgvector IVFFlat Cosine Indexes ─────────────────────────────────────────
-- lists=100 is a sensible default for up to ~1M rows; tune upward as data grows.
-- Requires at least (lists * 3) rows to be inserted before the index is useful.

CREATE INDEX "profiles_embeddingVector_ivfflat_idx"
    ON "profiles" USING ivfflat ("embeddingVector" vector_cosine_ops)
    WITH (lists = 100);

CREATE INDEX "projects_embeddingVector_ivfflat_idx"
    ON "projects" USING ivfflat ("embeddingVector" vector_cosine_ops)
    WITH (lists = 100);
