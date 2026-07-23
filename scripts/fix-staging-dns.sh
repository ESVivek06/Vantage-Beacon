#!/usr/bin/env bash
# Fix staging DNS: creates api.staging.vb.com + app.staging.vb.com → ECS ALB.
#
# IMPORTANT: The script first checks whether vb.com DNS is managed in Route53.
# If NOT in Route53 (e.g. cPanel/Hostinger hosting panel), it prints the ALB
# DNS name and instructions for manual CNAME entry in the hosting control panel.
#
# Requires: aws CLI, terraform CLI, jq, curl — configured for the staging
# AWS account (eu-west-2 for ALB/ECS, Route53 is global).
#
# Usage:
#   AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=yyy bash scripts/fix-staging-dns.sh
#
# The script is idempotent — safe to re-run.
set -euo pipefail

REGION="eu-west-2"
TF_DIR="infra/terraform/staging"
DOMAIN="vb.com"
STAGING_SUB="staging.vb.com"
API_HOST="api.staging.vb.com"
APP_HOST="app.staging.vb.com"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'
info()    { echo -e "${GREEN}[INFO]${RESET} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET} $*"; }
step()    { echo -e "${CYAN}[STEP]${RESET} $*"; }
die()     { echo -e "${RED}[FAIL]${RESET} $*"; exit 1; }

# ── Step 1: verify AWS access ─────────────────────────────────────────────────
step "1/6 Verifying AWS credentials..."
aws sts get-caller-identity > /dev/null || die "AWS credentials not configured. Export AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
info "AWS account: $ACCOUNT_ID"

# ── Step 2: get ALB DNS name and zone ID from Terraform output ────────────────
step "2/6 Reading ALB DNS from Terraform state..."
cd "$TF_DIR"
terraform init -reconfigure -input=false -no-color 2>&1 | tail -3
ALB_DNS=$(terraform output -raw alb_dns 2>/dev/null || echo "")
if [[ -z "$ALB_DNS" ]]; then
  warn "terraform output failed — querying AWS directly"
  ALB_DNS=$(aws elbv2 describe-load-balancers \
    --region "$REGION" \
    --query "LoadBalancers[?contains(LoadBalancerName,'staging')].DNSName | [0]" \
    --output text)
fi
[[ -z "$ALB_DNS" || "$ALB_DNS" == "None" ]] && die "Could not determine ALB DNS name. Is the staging stack deployed?"
info "ALB DNS: $ALB_DNS"

# Get ALB canonical hosted zone ID (needed for Route53 alias)
ALB_CANONICAL_ZONE=$(aws elbv2 describe-load-balancers \
  --region "$REGION" \
  --query "LoadBalancers[?DNSName=='${ALB_DNS}'].CanonicalHostedZoneId | [0]" \
  --output text)
[[ -z "$ALB_CANONICAL_ZONE" || "$ALB_CANONICAL_ZONE" == "None" ]] && die "Could not find ALB canonical hosted zone ID."
info "ALB canonical zone: $ALB_CANONICAL_ZONE"

# Back to repo root
cd - > /dev/null

# ── Step 3: detect whether DNS is managed in Route53 ─────────────────────────
step "3/6 Detecting DNS provider for ${DOMAIN}..."

# Check if vb.com or staging.vb.com nameservers are Route53
DOMAIN_NS=$(dig NS "$DOMAIN" +short 2>/dev/null || nslookup -type=NS "$DOMAIN" 8.8.8.8 2>/dev/null | grep "nameserver" | awk '{print $NF}' || echo "")

USE_ROUTE53=false
ZONE_ID=""
ZONE_DOMAIN=""

# Try Route53 lookup regardless of what dig says (hosted zone may exist even if NS not yet delegated)
ZONE_ID=$(aws route53 list-hosted-zones-by-name \
  --dns-name "${STAGING_SUB}." \
  --query "HostedZones[?Name=='${STAGING_SUB}.'].Id | [0]" \
  --output text 2>/dev/null || echo "")

if [[ -z "$ZONE_ID" || "$ZONE_ID" == "None" ]]; then
  ZONE_ID=$(aws route53 list-hosted-zones-by-name \
    --dns-name "${DOMAIN}." \
    --query "HostedZones[?Name=='${DOMAIN}.'].Id | [0]" \
    --output text 2>/dev/null || echo "")
  ZONE_DOMAIN="$DOMAIN"
else
  ZONE_DOMAIN="$STAGING_SUB"
fi

if [[ -n "$ZONE_ID" && "$ZONE_ID" != "None" ]]; then
  ZONE_ID="${ZONE_ID#/hostedzone/}"
  info "Route53 hosted zone found: $ZONE_ID (${ZONE_DOMAIN})"
  USE_ROUTE53=true
fi

# Check if current DNS response comes from LiteSpeed (shared hosting indicator)
CURRENT_SERVER=$(curl -sI --max-time 5 "http://${API_HOST}" 2>/dev/null | grep -i "^server:" | awk '{print $2}' | tr -d '\r' || echo "")
if echo "$CURRENT_SERVER" | grep -qi "litespeed\|apache\|nginx" && ! echo "$DOMAIN_NS" | grep -qi "awsdns"; then
  warn "DETECTED: ${API_HOST} currently resolves to a web hosting server (${CURRENT_SERVER:-unknown}), not the AWS ALB."
  warn "This means vb.com DNS is managed in a hosting control panel (cPanel/Hostinger/etc), not Route53."
fi

if [[ "$USE_ROUTE53" == "false" ]]; then
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${YELLOW}  DNS NOT IN ROUTE53 — Manual hosting panel action required${RESET}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo ""
  echo "  The domain vb.com is managed at a web hosting provider (not Route53)."
  echo "  Log into your hosting control panel (cPanel/Hostinger/etc) and add:"
  echo ""
  echo -e "  ${GREEN}CNAME  api.staging     →  ${ALB_DNS}${RESET}"
  echo -e "  ${GREEN}CNAME  app.staging     →  ${ALB_DNS}${RESET}"
  echo ""
  echo "  Or as A records (if CNAME not supported for subdomain):"
  echo "  Resolve the ALB IPs first:  dig +short ${ALB_DNS}"
  echo "  Then add A records for api.staging and app.staging pointing to those IPs."
  echo ""
  echo "  After adding DNS records, also run terraform apply to activate HTTPS:"
  echo "    cd infra/terraform/staging/"
  echo "    terraform apply -var=\"acm_cert_arn=<ACM_CERT_ARN_eu-west-2>\" ..."
  echo ""
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo ""
  echo "  ALB DNS (copy this): ${ALB_DNS}"
  echo ""
  exit 0
fi

# ── Step 4: find or create ACM certificate ────────────────────────────────────
step "4/6 Finding ACM certificate for *.${STAGING_SUB} in ${REGION}..."
CERT_ARN=$(aws acm list-certificates \
  --region "$REGION" \
  --query "CertificateSummaryList[?DomainName=='*.${STAGING_SUB}' && Status=='ISSUED'].CertificateArn | [0]" \
  --output text 2>/dev/null || echo "")

if [[ -z "$CERT_ARN" || "$CERT_ARN" == "None" ]]; then
  warn "No issued cert found. Requesting new ACM cert for *.${STAGING_SUB}..."
  CERT_ARN=$(aws acm request-certificate \
    --region "$REGION" \
    --domain-name "*.${STAGING_SUB}" \
    --subject-alternative-names "${STAGING_SUB}" \
    --validation-method DNS \
    --query CertificateArn \
    --output text)
  info "Requested cert: $CERT_ARN"

  info "Adding DNS validation records to Route53..."
  sleep 5
  VALIDATION_OPTIONS=$(aws acm describe-certificate \
    --region "$REGION" \
    --certificate-arn "$CERT_ARN" \
    --query "Certificate.DomainValidationOptions" \
    --output json)

  VALIDATION_CHANGES=$(echo "$VALIDATION_OPTIONS" | jq '[
    .[] | select(.ResourceRecord != null) | {
      Action: "UPSERT",
      ResourceRecordSet: {
        Name: .ResourceRecord.Name,
        Type: .ResourceRecord.Type,
        TTL: 300,
        ResourceRecords: [{ Value: .ResourceRecord.Value }]
      }
    }
  ]')

  aws route53 change-resource-record-sets \
    --hosted-zone-id "$ZONE_ID" \
    --change-batch "{\"Changes\": $VALIDATION_CHANGES}" > /dev/null

  info "DNS validation records added. Waiting for cert to issue (up to 5 min)..."
  aws acm wait certificate-validated \
    --region "$REGION" \
    --certificate-arn "$CERT_ARN" || die "Certificate validation timed out. Check Route53 CNAME records and retry."
  info "Certificate issued: $CERT_ARN"
else
  info "Using existing cert: $CERT_ARN"
fi

# ── Step 5: create/update Route53 alias records ───────────────────────────────
step "5/6 Creating Route53 alias records..."

create_alias_record() {
  local name="$1"
  aws route53 change-resource-record-sets \
    --hosted-zone-id "$ZONE_ID" \
    --change-batch "$(jq -n \
      --arg name "$name." \
      --arg alb_dns "$ALB_DNS" \
      --arg alb_zone "$ALB_CANONICAL_ZONE" \
      '{
        Changes: [{
          Action: "UPSERT",
          ResourceRecordSet: {
            Name: $name,
            Type: "A",
            AliasTarget: {
              DNSName: $alb_dns,
              HostedZoneId: $alb_zone,
              EvaluateTargetHealth: true
            }
          }
        }]
      }'
    )" > /dev/null
  info "  $name → $ALB_DNS"
}

create_alias_record "$API_HOST"
create_alias_record "$APP_HOST"

# Apply Terraform to activate HTTPS listener with cert
step "6/6 Applying Terraform (activating HTTPS listener + Route53 records)..."
cd "$TF_DIR"
terraform apply \
  -var="route53_zone_id=${ZONE_ID}" \
  -var="acm_cert_arn=${CERT_ARN}" \
  -auto-approve \
  -input=false \
  -no-color 2>&1 | tail -20
cd - > /dev/null

# ── Step 6/7: verify ──────────────────────────────────────────────────────────
info "Waiting 30s for DNS propagation..."
sleep 30

info "Verifying api.staging.vb.com/health..."
HEALTH_STATUS=$(curl -sL -o /tmp/health_resp.txt -w "%{http_code}" \
  --max-time 15 \
  "https://${API_HOST}/health" 2>/dev/null || echo "000")

echo "HTTP status: $HEALTH_STATUS"
cat /tmp/health_resp.txt 2>/dev/null || true

if [[ "$HEALTH_STATUS" == "200" ]]; then
  echo ""
  echo -e "${GREEN}╔═══════════════════════════════════════╗${RESET}"
  echo -e "${GREEN}║  api.staging.vb.com is LIVE ✓         ║${RESET}"
  echo -e "${GREEN}║  VAN-55, VAN-56, VAN-51 unblocked     ║${RESET}"
  echo -e "${GREEN}╚═══════════════════════════════════════╝${RESET}"
else
  warn "Health check returned HTTP $HEALTH_STATUS. DNS may still be propagating."
  warn "Retry in 2–5 min: curl https://${API_HOST}/health"
fi
