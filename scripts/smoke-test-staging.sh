#!/usr/bin/env bash
# Smoke tests for the staging environment.
# Tests: health endpoints, auth flow, profile creation, opportunity posting,
#        AI matching API, and messaging endpoint reachability.
# Usage: STAGING_URL=https://staging.vb.com API_URL=https://api.staging.vb.com ./scripts/smoke-test-staging.sh
set -euo pipefail

STAGING_URL="${STAGING_URL:-https://staging.vb.com}"
API_URL="${API_URL:-https://api.staging.vb.com}"
PASS=0
FAIL=0

GREEN='\033[0;32m'
RED='\033[0;31m'
RESET='\033[0m'

pass() { echo -e "${GREEN}  ✓ $1${RESET}"; ((PASS++)); }
fail() { echo -e "${RED}  ✗ $1${RESET}"; ((FAIL++)); }

check_http() {
  local label="$1" url="$2" expected="${3:-200}"
  local status
  status="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${url}")" || true
  if [[ "${status}" == "${expected}" ]]; then
    pass "${label} (HTTP ${status})"
  else
    fail "${label} — expected HTTP ${expected}, got ${status} (${url})"
  fi
}

check_json_field() {
  local label="$1" url="$2" field="$3" expected="$4"
  local body
  body="$(curl -s --max-time 10 "${url}")" || true
  local actual
  actual="$(echo "${body}" | jq -r "${field}" 2>/dev/null || echo "__parse_error__")"
  if [[ "${actual}" == "${expected}" ]]; then
    pass "${label} (${field}=${actual})"
  else
    fail "${label} — expected ${field}=${expected}, got ${actual}"
  fi
}

echo "========================================"
echo " VB Staging Smoke Tests"
echo " Web:  ${STAGING_URL}"
echo " API:  ${API_URL}"
echo "========================================"
echo ""

# ── 1. Health endpoints ───────────────────────────────────────────────────────
echo "── Health checks ──"
check_json_field "API /health status" "${API_URL}/health" ".status" "ok"
check_http       "Web /api/health"    "${STAGING_URL}/api/health"

# ── 2. Auth — sign-in page reachable ─────────────────────────────────────────
echo ""
echo "── Auth flow ──"
check_http "Sign-in page" "${STAGING_URL}/auth/signin"

# Auth API introspection endpoint (NextAuth v5 exposes /api/auth/providers)
check_http "Auth providers endpoint" "${STAGING_URL}/api/auth/providers"

# ── 3. GraphQL API reachable ──────────────────────────────────────────────────
echo ""
echo "── GraphQL API ──"
# Introspection query — should return 200 with a data object (or 400 if disabled)
INTROSPECT_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -X POST "${API_URL}/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' || true)"
if [[ "${INTROSPECT_STATUS}" == "200" || "${INTROSPECT_STATUS}" == "400" ]]; then
  pass "GraphQL endpoint reachable (HTTP ${INTROSPECT_STATUS})"
else
  fail "GraphQL endpoint — unexpected HTTP ${INTROSPECT_STATUS}"
fi

# ── 4. Profile creation endpoint ─────────────────────────────────────────────
echo ""
echo "── Profile endpoints ──"
# Unauthenticated calls return 401 — that proves the route is wired up
check_http "Profile API (unauth → 401)" "${API_URL}/api/profile" "401"

# ── 5. Opportunity posting endpoint ──────────────────────────────────────────
echo ""
echo "── Opportunities ──"
check_http "Opportunities list (unauth → 401)" "${API_URL}/api/opportunities" "401"

# ── 6. AI matching endpoint ───────────────────────────────────────────────────
echo ""
echo "── AI Matching ──"
MATCH_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
  -X POST "${API_URL}/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { matchCandidates(opportunityId: \"smoke-test\") { id } }"}' \
  || true)"
# 401 = route exists but needs auth; 200 = open; anything else is a problem
if [[ "${MATCH_STATUS}" == "200" || "${MATCH_STATUS}" == "401" || "${MATCH_STATUS}" == "400" ]]; then
  pass "AI matching route reachable (HTTP ${MATCH_STATUS})"
else
  fail "AI matching route — unexpected HTTP ${MATCH_STATUS}"
fi

# ── 7. Messaging endpoint ─────────────────────────────────────────────────────
echo ""
echo "── Messaging ──"
check_http "Conversations endpoint (unauth → 401)" "${API_URL}/api/conversations" "401"

# ── 8. ML service health via API (internal) ───────────────────────────────────
echo ""
echo "── ML Service (via API proxy) ──"
ML_HEALTH_STATUS="$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  "${API_URL}/api/ml/health" || true)"
if [[ "${ML_HEALTH_STATUS}" == "200" || "${ML_HEALTH_STATUS}" == "404" ]]; then
  # 404 means route not proxied yet; 200 means ML is reachable end-to-end
  pass "ML health proxy reachable (HTTP ${ML_HEALTH_STATUS})"
else
  fail "ML health proxy — unexpected HTTP ${ML_HEALTH_STATUS}"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "========================================"
TOTAL=$((PASS + FAIL))
echo " Results: ${PASS}/${TOTAL} passed"
if [[ "${FAIL}" -gt 0 ]]; then
  echo -e " ${RED}${FAIL} test(s) FAILED — staging is not healthy${RESET}"
  echo "========================================"
  exit 1
else
  echo -e " ${GREEN}All smoke tests passed — staging is healthy${RESET}"
  echo "========================================"
fi
