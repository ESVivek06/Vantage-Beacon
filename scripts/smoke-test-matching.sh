#!/usr/bin/env bash
# AI Matching Engine smoke test — VAN-55 / VAN-56
#
# Authenticates as each synthetic test user (3 founders, 5 freelancers, 2 investors),
# calls matchCandidates, and validates the response structure, latency, and ranking.
#
# Prerequisites:
#   - Staging DB seeded: DATABASE_URL=<url> npx tsx packages/database/prisma/seed.staging-validation.ts
#   - jq installed (brew install jq / apt-get install jq)
#
# Usage:
#   API_URL=https://api.staging.vb.com ./scripts/smoke-test-matching.sh
#   API_URL=https://api.staging.vb.com SEED_FIRST=1 DATABASE_URL=<url> ./scripts/smoke-test-matching.sh
#
# Exit: 0 = all checks passed, 1 = one or more failures
set -euo pipefail

API_URL="${API_URL:-https://api.staging.vb.com}"
STAGING_PASSWORD="${STAGING_PASSWORD:-StagingTest123!}"
MATCH_LIMIT="${MATCH_LIMIT:-5}"
LATENCY_THRESHOLD_MS="${LATENCY_THRESHOLD_MS:-2000}"
SEED_FIRST="${SEED_FIRST:-0}"
DATABASE_URL="${DATABASE_URL:-}"

PASS=0
FAIL=0
WARN=0

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

pass()  { echo -e "${GREEN}  ✓ $1${RESET}"; ((PASS++)); }
fail()  { echo -e "${RED}  ✗ $1${RESET}"; ((FAIL++)); }
warn()  { echo -e "${YELLOW}  ⚠ $1${RESET}"; ((WARN++)); }
info()  { echo -e "${BLUE}    $1${RESET}"; }
header(){ echo -e "\n${BOLD}── $1 ──${RESET}"; }

# ── Dependency check ──────────────────────────────────────────────────────────

if ! command -v jq &>/dev/null; then
  echo -e "${RED}ERROR: jq is required. Install with: brew install jq / apt-get install jq${RESET}"
  exit 1
fi
if ! command -v curl &>/dev/null; then
  echo -e "${RED}ERROR: curl is required.${RESET}"
  exit 1
fi

echo -e "${BOLD}========================================"
echo " VB Matching Engine Smoke Test — VAN-55"
echo " API: ${API_URL}"
echo " Match limit: ${MATCH_LIMIT} | Latency threshold: ${LATENCY_THRESHOLD_MS}ms"
echo -e "========================================${RESET}"

# ── Optional: seed staging DB ─────────────────────────────────────────────────

if [[ "${SEED_FIRST}" == "1" ]]; then
  header "Seeding staging DB"
  if [[ -z "${DATABASE_URL}" ]]; then
    fail "SEED_FIRST=1 but DATABASE_URL is not set"
  else
    echo "  Running seed.staging-validation.ts..."
    DATABASE_URL="${DATABASE_URL}" npx tsx packages/database/prisma/seed.staging-validation.ts
    pass "Staging DB seeded (3 founders / 5 freelancers / 2 investors)"
  fi
fi

# ── GraphQL helpers ───────────────────────────────────────────────────────────

# gql_request <token_or_empty> <json_payload> <timeout_s>
# Prints the raw JSON response body; returns curl exit code.
gql_request() {
  local token="$1"
  local payload="$2"
  local timeout="${3:-10}"
  local auth_header=""
  if [[ -n "${token}" ]]; then
    auth_header="-H \"Authorization: Bearer ${token}\""
  fi
  eval curl -s --max-time "${timeout}" \
    -X POST "${API_URL}/graphql" \
    -H "'Content-Type: application/json'" \
    ${auth_header} \
    --data-binary "'${payload}'" 2>/dev/null
}

# login <email> <password> — echoes JWT token, sets USER_ID
login() {
  local email="$1" password="$2"
  local payload
  payload=$(jq -nc \
    --arg email "${email}" \
    --arg pw "${password}" \
    '{query:"mutation Login($i:LoginInput!){login(input:$i){token user{id}}}",variables:{i:{email:$email,password:$pw}}}')
  local body
  body=$(curl -s --max-time 10 \
    -X POST "${API_URL}/graphql" \
    -H "Content-Type: application/json" \
    --data-binary "${payload}" 2>/dev/null)
  TOKEN=$(echo "${body}" | jq -r '.data.login.token // empty' 2>/dev/null)
  USER_ID=$(echo "${body}" | jq -r '.data.login.user.id // empty' 2>/dev/null)
}

# ── match_test <display_name> <email> <role> <expected_top_skills...>
# Authenticates, calls matchCandidates, validates structure + latency, checks top-3 relevance.
MATCH_QUERY='query MC($uid:ID!,$role:UserRole!,$limit:Int){matchCandidates(userId:$uid,role:$role,limit:$limit){id sourceId targetId targetType score explanation{semanticScore skillOverlap regionMatch topReasons} displayName region role}}'

run_match_test() {
  local label="$1" email="$2" role="$3"
  shift 3
  local expected_tags=("$@")

  echo ""
  echo -e "  ${BOLD}${label}${RESET} (${email} / ${role})"

  # 1. Login
  TOKEN=""
  USER_ID=""
  login "${email}" "${STAGING_PASSWORD}"
  if [[ -z "${TOKEN}" || -z "${USER_ID}" ]]; then
    fail "${label}: login failed — no token returned"
    return
  fi
  pass "${label}: authenticated (userId=${USER_ID:0:8}…)"

  # 2. Call matchCandidates and measure latency
  local payload
  payload=$(jq -nc \
    --arg uid "${USER_ID}" \
    --arg role "${role}" \
    --argjson limit "${MATCH_LIMIT}" \
    --arg q "${MATCH_QUERY}" \
    '{query:$q,variables:{uid:$uid,role:$role,limit:$limit}}')

  local t_start t_end elapsed_ms body
  t_start=$(date +%s%N)
  body=$(curl -s --max-time 15 \
    -X POST "${API_URL}/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    --data-binary "${payload}" 2>/dev/null)
  t_end=$(date +%s%N)
  elapsed_ms=$(( (t_end - t_start) / 1000000 ))

  # 3. Check for HTTP-level / GraphQL errors
  local gql_errors
  gql_errors=$(echo "${body}" | jq -r '.errors[0].message // empty' 2>/dev/null)
  if [[ -n "${gql_errors}" ]]; then
    fail "${label}: GraphQL error — ${gql_errors}"
    return
  fi

  # 4. Validate results array is non-empty
  local result_count
  result_count=$(echo "${body}" | jq '.data.matchCandidates | length' 2>/dev/null || echo 0)
  if [[ "${result_count}" -eq 0 ]]; then
    fail "${label}: matchCandidates returned 0 results"
    return
  fi
  pass "${label}: ${result_count} candidates returned"

  # 5. Validate latency
  if [[ "${elapsed_ms}" -lt "${LATENCY_THRESHOLD_MS}" ]]; then
    pass "${label}: latency ${elapsed_ms}ms < ${LATENCY_THRESHOLD_MS}ms threshold"
  else
    fail "${label}: latency ${elapsed_ms}ms EXCEEDS ${LATENCY_THRESHOLD_MS}ms threshold"
  fi

  # 6. Validate top result has score > 0 and topReasons populated
  local top_score top_reasons_count
  top_score=$(echo "${body}" | jq -r '.data.matchCandidates[0].score' 2>/dev/null || echo 0)
  top_reasons_count=$(echo "${body}" | jq '.data.matchCandidates[0].explanation.topReasons | length' 2>/dev/null || echo 0)

  if (( $(echo "${top_score} > 0" | bc -l 2>/dev/null || echo 0) )); then
    pass "${label}: top score ${top_score} > 0"
  else
    fail "${label}: top score is 0 or missing"
  fi

  if [[ "${top_reasons_count}" -gt 0 ]]; then
    pass "${label}: topReasons populated (${top_reasons_count} reasons)"
  else
    fail "${label}: topReasons empty on top result"
  fi

  # 7. Check top-3 results are ranked in descending score order
  local ordered
  ordered=$(echo "${body}" | jq '
    .data.matchCandidates[:3] |
    . as $arr |
    if length < 2 then true
    else
      reduce range(1; length) as $i (true; . and ($arr[$i-1].score >= $arr[$i].score))
    end
  ' 2>/dev/null || echo "false")
  if [[ "${ordered}" == "true" ]]; then
    pass "${label}: top-3 results are score-ranked (descending)"
  else
    fail "${label}: top-3 results are NOT in descending score order"
  fi

  # 8. Semantic relevance — check any top-3 result has a matching expected tag/skill
  if [[ ${#expected_tags[@]} -gt 0 ]]; then
    local top3_reasons
    top3_reasons=$(echo "${body}" | jq -r '
      [.data.matchCandidates[:3][].explanation.topReasons[]] | join(" ") | ascii_downcase
    ' 2>/dev/null || echo "")
    local matched_tag=""
    for tag in "${expected_tags[@]}"; do
      if echo "${top3_reasons}" | grep -qi "${tag}"; then
        matched_tag="${tag}"
        break
      fi
    done
    if [[ -n "${matched_tag}" ]]; then
      pass "${label}: top-3 reasons reference expected domain ('${matched_tag}')"
    else
      warn "${label}: top-3 reasons don't mention expected tags (${expected_tags[*]}) — check ML relevance"
    fi
  fi

  # 9. Log top-3 matches for the report
  info "Top matches:"
  echo "${body}" | jq -r '
    .data.matchCandidates[:3] | to_entries[] |
    "    #\(.key+1)  \(.value.displayName // "unknown") [\(.value.role // "?")] score=\(.value.score | . * 1000 | round / 1000)  reasons=\(.value.explanation.topReasons[:2] | join(", "))"
  ' 2>/dev/null | while read -r line; do echo -e "  ${BLUE}${line}${RESET}"; done
}

# ── 1. API health check before running matching tests ─────────────────────────

header "Pre-flight"
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "${API_URL}/health" || echo "000")
if [[ "${HEALTH_STATUS}" == "200" ]]; then
  pass "API /health → 200"
else
  fail "API /health → ${HEALTH_STATUS} (expected 200) — aborting"
  echo -e "${RED}Staging API is not reachable. Aborting match tests.${RESET}"
  exit 1
fi

GQL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -X POST "${API_URL}/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}' || echo "000")
if [[ "${GQL_STATUS}" == "200" ]]; then
  pass "GraphQL endpoint → 200"
else
  fail "GraphQL endpoint → ${GQL_STATUS} — aborting"
  exit 1
fi

# ── 2. Founder tests ──────────────────────────────────────────────────────────

header "Founder matching (founder_to_investor)"

run_match_test \
  "Amara Osei (PanPay / fintech / series_a)" \
  "amara.osei@staging-van56.test" \
  "founder" \
  "fintech" "payments" "series" "investment"

run_match_test \
  "Priya Nair (TutorAI / edtech / seed)" \
  "priya.nair@staging-van56.test" \
  "founder" \
  "edtech" "ai" "education" "seed"

run_match_test \
  "Lars Eriksson (CarbonTrack / climate / pre_seed)" \
  "lars.eriksson@staging-van56.test" \
  "founder" \
  "climate" "sustainability" "saas" "pre_seed"

# ── 3. Freelancer tests ───────────────────────────────────────────────────────

header "Freelancer matching (freelancer_to_project)"

run_match_test \
  "Sophie Wu (React/TypeScript / fintech)" \
  "sophie.wu@staging-van56.test" \
  "freelancer" \
  "react" "typescript" "frontend" "fintech"

run_match_test \
  "Kofi Mensah (Node.js/Stripe / payments)" \
  "kofi.mensah@staging-van56.test" \
  "freelancer" \
  "node" "stripe" "payments" "backend"

run_match_test \
  "Nina Patel (Full-stack / SaaS MVPs)" \
  "nina.patel@staging-van56.test" \
  "freelancer" \
  "saas" "mvp" "fullstack" "startup"

run_match_test \
  "Daniel Kim (ML / NLP / LLMs)" \
  "daniel.kim@staging-van56.test" \
  "freelancer" \
  "nlp" "llm" "python" "pytorch" "ai"

run_match_test \
  "Fatima Al-Hassan (React Native / mobile fintech)" \
  "fatima.alhassan@staging-van56.test" \
  "freelancer" \
  "mobile" "react native" "fintech" "ios"

# ── 4. Investor tests ─────────────────────────────────────────────────────────

header "Investor matching (founder_to_investor)"

run_match_test \
  "Callum Ross (angel / SaaS + Fintech + Climate)" \
  "callum.ross@staging-van56.test" \
  "investor" \
  "saas" "fintech" "climate" "angel"

run_match_test \
  "Elena Vasquez (VC / AI + DeepTech + Climate)" \
  "elena.vasquez@staging-van56.test" \
  "investor" \
  "ai" "deeptech" "climate" "machine learning"

# ── 5. Edge case: low-limit call ─────────────────────────────────────────────

header "Edge cases"

echo ""
echo -e "  ${BOLD}Low-limit call (limit=1)${RESET}"
TOKEN=""
USER_ID=""
login "amara.osei@staging-van56.test" "${STAGING_PASSWORD}"
if [[ -n "${TOKEN}" && -n "${USER_ID}" ]]; then
  EDGE_PAYLOAD=$(jq -nc \
    --arg uid "${USER_ID}" \
    --arg q "${MATCH_QUERY}" \
    '{query:$q,variables:{uid:$uid,role:"founder",limit:1}}')
  EDGE_BODY=$(curl -s --max-time 10 \
    -X POST "${API_URL}/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    --data-binary "${EDGE_PAYLOAD}" 2>/dev/null)
  EDGE_COUNT=$(echo "${EDGE_BODY}" | jq '.data.matchCandidates | length' 2>/dev/null || echo 0)
  if [[ "${EDGE_COUNT}" -eq 1 ]]; then
    pass "limit=1 returns exactly 1 result"
  else
    fail "limit=1 returned ${EDGE_COUNT} results (expected 1)"
  fi
fi

echo ""
echo -e "  ${BOLD}Unauthorized call (no token)${RESET}"
UNAUTH_BODY=$(curl -s --max-time 10 \
  -X POST "${API_URL}/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{matchCandidates(userId:\"fake-id\",role:founder){id}}"}' 2>/dev/null)
UNAUTH_ERROR=$(echo "${UNAUTH_BODY}" | jq -r '.errors[0].message // empty' 2>/dev/null)
if [[ -n "${UNAUTH_ERROR}" ]]; then
  pass "Unauthenticated call rejected: ${UNAUTH_ERROR}"
else
  fail "Unauthenticated call should have returned a GraphQL error"
fi

echo ""
echo -e "  ${BOLD}Cross-user call (forbidden)${RESET}"
TOKEN=""
USER_ID=""
login "amara.osei@staging-van56.test" "${STAGING_PASSWORD}"
if [[ -n "${TOKEN}" ]]; then
  FORBIDDEN_BODY=$(curl -s --max-time 10 \
    -X POST "${API_URL}/graphql" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"query":"query{matchCandidates(userId:\"00000000-0000-0000-0000-000000000000\",role:founder){id}}"}' 2>/dev/null)
  FORBIDDEN_ERROR=$(echo "${FORBIDDEN_BODY}" | jq -r '.errors[0].message // empty' 2>/dev/null)
  if echo "${FORBIDDEN_ERROR}" | grep -qi "forbidden"; then
    pass "Cross-user call rejected with Forbidden error"
  else
    fail "Cross-user call should be rejected with Forbidden — got: ${FORBIDDEN_ERROR:-<no error>}"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}========================================"
TOTAL=$((PASS + FAIL + WARN))
echo " Results: ${PASS} passed / ${FAIL} failed / ${WARN} warnings (${TOTAL} total)"
if [[ "${FAIL}" -gt 0 ]]; then
  echo -e " ${RED}FAILED — ${FAIL} check(s) did not pass${RESET}"
  echo "========================================"
  echo ""
  echo "Troubleshooting:"
  echo "  • No results → ML service may be down: curl ${API_URL}/api/ml/health"
  echo "  • Login failures → seed not run: SEED_FIRST=1 DATABASE_URL=<url> $0"
  echo "  • Latency failure → check ML service ECS task CPU/memory in CloudWatch"
  echo "  • Ranking failure → check pgvector IVFFlat index: SELECT * FROM pg_indexes WHERE tablename='UserEmbedding';"
  echo "========================================"
  exit 1
else
  echo -e " ${GREEN}All checks passed — matching engine is healthy${RESET}"
  if [[ "${WARN}" -gt 0 ]]; then
    echo -e " ${YELLOW}${WARN} warning(s) — review top-match relevance manually${RESET}"
  fi
  echo "========================================"
fi
