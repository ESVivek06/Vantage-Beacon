-- Match feedback table: records user accept/reject signals for the feedback loop.
-- PK on (matchId, userId) so each user can revise a decision but not duplicate it.

CREATE TYPE "MatchFeedbackAction" AS ENUM ('accepted', 'rejected');

CREATE TABLE "match_feedback" (
    "id"         UUID                    NOT NULL DEFAULT gen_random_uuid(),
    "matchId"    UUID                    NOT NULL,
    "userId"     UUID                    NOT NULL,
    "action"     "MatchFeedbackAction"   NOT NULL,
    "reason"     TEXT,
    "createdAt"  TIMESTAMPTZ(6)          NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_feedback_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "match_feedback_matchId_userId_key" UNIQUE ("matchId", "userId")
);

ALTER TABLE "match_feedback"
    ADD CONSTRAINT "match_feedback_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- No FK on matchId — matches are soft-deleted, feedback rows outlive them.

CREATE INDEX "match_feedback_matchId_idx"   ON "match_feedback"("matchId");
CREATE INDEX "match_feedback_userId_idx"    ON "match_feedback"("userId");
CREATE INDEX "match_feedback_action_idx"    ON "match_feedback"("action");
CREATE INDEX "match_feedback_createdAt_idx" ON "match_feedback"("createdAt" DESC);
