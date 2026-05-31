-- GDPR compliance: audit log, GDPR request tracking, consent records
-- Applied to each regional cluster (UK / NA / IN).

-- ─── New Enums ────────────────────────────────────────────────────────────────

CREATE TYPE "AuditAction" AS ENUM (
  'profile_update',
  'data_export_requested',
  'data_export_completed',
  'erasure_requested',
  'erasure_completed',
  'dpa_accepted',
  'cookie_consent_given'
);

CREATE TYPE "GdprRequestType" AS ENUM ('erasure', 'export');

CREATE TYPE "GdprRequestStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TYPE "ConsentType" AS ENUM ('dpa', 'cookie_analytics', 'cookie_marketing');

-- ─── Audit Log ────────────────────────────────────────────────────────────────
-- Append-only: no UPDATE or DELETE ever issued against this table.

CREATE TABLE "audit_logs" (
    "id"          UUID           NOT NULL DEFAULT gen_random_uuid(),
    "userId"      UUID           NOT NULL,
    "action"      "AuditAction"  NOT NULL,
    "entityId"    UUID,
    "entityType"  TEXT,
    "ipAddress"   TEXT,
    "metadata"    JSONB          NOT NULL DEFAULT '{}',
    "createdAt"   TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "audit_logs_userId_idx"    ON "audit_logs"("userId");
CREATE INDEX "audit_logs_action_idx"    ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt" DESC);

-- ─── GDPR Requests ────────────────────────────────────────────────────────────

CREATE TABLE "gdpr_requests" (
    "id"          UUID                NOT NULL DEFAULT gen_random_uuid(),
    "userId"      UUID                NOT NULL,
    "type"        "GdprRequestType"   NOT NULL,
    "status"      "GdprRequestStatus" NOT NULL DEFAULT 'pending',
    "scheduledAt" TIMESTAMPTZ(6),
    "completedAt" TIMESTAMPTZ(6),
    "exportUrl"   TEXT,
    "metadata"    JSONB               NOT NULL DEFAULT '{}',
    "createdAt"   TIMESTAMPTZ(6)      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMPTZ(6)      NOT NULL,

    CONSTRAINT "gdpr_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gdpr_requests_userId_idx"      ON "gdpr_requests"("userId");
CREATE INDEX "gdpr_requests_type_idx"        ON "gdpr_requests"("type");
CREATE INDEX "gdpr_requests_status_idx"      ON "gdpr_requests"("status");
CREATE INDEX "gdpr_requests_scheduledAt_idx" ON "gdpr_requests"("scheduledAt")
    WHERE "scheduledAt" IS NOT NULL;

-- ─── User Consents ────────────────────────────────────────────────────────────

CREATE TABLE "user_consents" (
    "id"         UUID          NOT NULL DEFAULT gen_random_uuid(),
    "userId"     UUID          NOT NULL,
    "type"       "ConsentType" NOT NULL,
    "version"    TEXT          NOT NULL,
    "accepted"   BOOLEAN       NOT NULL,
    "ipAddress"  TEXT,
    "userAgent"  TEXT,
    "acceptedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_consents_userId_type_version_key" UNIQUE ("userId", "type", "version")
);

CREATE INDEX "user_consents_userId_idx" ON "user_consents"("userId");
CREATE INDEX "user_consents_type_idx"   ON "user_consents"("type");

-- ─── Global Metadata Migration (run against DATABASE_URL_GLOBAL) ─────────────
-- Applied separately; shown here for reference only.
--
-- CREATE TABLE "user_region_mappings" (
--     "userId"    UUID           NOT NULL,
--     "region"    TEXT           NOT NULL,
--     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMPTZ(6) NOT NULL,
--     CONSTRAINT "user_region_mappings_pkey" PRIMARY KEY ("userId")
-- );
