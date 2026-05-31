-- Global metadata cluster migration.
-- Applied to DATABASE_URL_GLOBAL (a separate Postgres instance with NO PII).
-- Only userId → region mappings are stored here.

CREATE TABLE "user_region_mappings" (
    "userId"    UUID           NOT NULL,
    "region"    TEXT           NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_region_mappings_pkey" PRIMARY KEY ("userId")
);

CREATE INDEX "user_region_mappings_region_idx" ON "user_region_mappings"("region");
