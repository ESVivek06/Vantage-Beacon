#!/usr/bin/env bash
# add-staging-dns.sh — Print (and optionally apply) staging CNAME records for vb.com
#
# vb.com DNS is managed by Moniker (ns1-4.monikerdns.net).
# After terraform apply creates the ALB, run this script to get the CNAME values
# to add in the Moniker control panel at https://www.moniker.com/
#
# Usage:
#   ./scripts/add-staging-dns.sh                    # auto-detect ALB DNS from AWS
#   ./scripts/add-staging-dns.sh <alb-dns-name>     # pass ALB DNS name directly

set -euo pipefail

REGION="${AWS_REGION:-eu-west-2}"
ALB_NAME="vb-staging-uk-alb"

# ── 1. Get ALB DNS name ───────────────────────────────────────────────────────
if [ -n "${1:-}" ]; then
  ALB_DNS="$1"
else
  echo "Looking up ALB DNS name in region $REGION..."
  ALB_DNS=$(aws elbv2 describe-load-balancers \
    --names "$ALB_NAME" \
    --region "$REGION" \
    --query 'LoadBalancers[0].DNSName' \
    --output text 2>/dev/null || echo "")

  if [ -z "$ALB_DNS" ] || [ "$ALB_DNS" = "None" ]; then
    echo ""
    echo "ERROR: ALB '$ALB_NAME' not found in $REGION."
    echo ""
    echo "Prerequisites before DNS can be configured:"
    echo "  1. Create ELB service-linked role (one-time admin action):"
    echo "     aws iam create-service-linked-role --aws-service-name elasticloadbalancing.amazonaws.com"
    echo "  2. Run: terraform apply in infra/terraform/staging/"
    echo ""
    exit 1
  fi
fi

echo ""
echo "=== Staging DNS Records to Add in Moniker ==="
echo ""
echo "Log in to https://www.moniker.com/ → Domain Manager → vb.com → DNS Records"
echo ""
echo "Add the following CNAME records (TTL: 300):"
echo ""
printf "  %-35s  CNAME  %s\n" "api.staging.vb.com" "$ALB_DNS"
printf "  %-35s  CNAME  %s\n" "app.staging.vb.com" "$ALB_DNS"
echo ""
echo "After adding records, verify propagation (may take up to 5 minutes with TTL 300):"
echo "  dig CNAME api.staging.vb.com +short"
echo "  curl http://api.staging.vb.com/health"
echo ""

# ── 2. Verify current DNS resolution ─────────────────────────────────────────
echo "=== Current DNS Resolution ==="
for host in api.staging.vb.com app.staging.vb.com; do
  resolved=$(curl -s "https://dns.google/resolve?name=${host}&type=CNAME" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['Answer'][0]['data'] if d.get('Answer') else 'NOT RESOLVED')" 2>/dev/null || echo "lookup failed")
  printf "  %-35s -> %s\n" "$host" "$resolved"
done
echo ""
