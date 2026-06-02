#!/usr/bin/env bash
# Deploy API, Web, and ML Docker images to ECR and update ECS staging services.
# Prerequisites: AWS CLI configured, Docker running, jq installed.
# Usage: ./scripts/deploy-staging.sh [--services api,web,ml]
set -euo pipefail

# Verify terraform was applied with all required secrets before deploying
REQUIRED_SECRETS=(
  "auth-secret"
  "unsubscribe-secret"
  "upstash-redis-rest-url"
  "upstash-redis-rest-token"
  "google-client-id"
  "google-client-secret"
  "linkedin-client-id"
  "linkedin-client-secret"
)
echo "==> Checking Secrets Manager for required secrets…"
MISSING=0
for secret in "${REQUIRED_SECRETS[@]}"; do
  if ! aws secretsmanager describe-secret --secret-id "/vb/staging/${secret}" \
       --query "Name" --output text >/dev/null 2>&1; then
    echo "  MISSING: /vb/staging/${secret}" >&2
    ((MISSING++))
  fi
done
if [[ "${MISSING}" -gt 0 ]]; then
  echo "ERROR: ${MISSING} secret(s) missing — run terraform apply first." >&2
  exit 1
fi
echo "  All secrets present ✓"
echo ""

AWS_REGION="${AWS_REGION:-eu-west-2}"
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_BASE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
CLUSTER="vb-staging-uk"
ENVIRONMENT="staging"
SERVICES="${1:-api,web,ml}"
GIT_SHA="$(git rev-parse --short HEAD)"
TAG="${GIT_SHA}"

echo "==> Deploying [${SERVICES}] to ${CLUSTER} (tag: ${TAG})"

# ECR login
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ECR_BASE}"

IFS=',' read -ra SVC_LIST <<< "${SERVICES}"

for svc in "${SVC_LIST[@]}"; do
  REPO="${ECR_BASE}/vb-${ENVIRONMENT}-${svc}"
  echo ""
  echo "── Building ${svc} ──"

  case "${svc}" in
    api)
      docker build \
        --file apps/api/Dockerfile \
        --tag "${REPO}:${TAG}" \
        --tag "${REPO}:latest" \
        .
      ;;
    web)
      docker build \
        --file apps/web/Dockerfile \
        --tag "${REPO}:${TAG}" \
        --tag "${REPO}:latest" \
        .
      ;;
    ml)
      docker build \
        --file apps/ml/Dockerfile \
        --tag "${REPO}:${TAG}" \
        --tag "${REPO}:latest" \
        .
      ;;
    *)
      echo "Unknown service: ${svc}" >&2
      exit 1
      ;;
  esac

  echo "── Pushing ${svc} ──"
  docker push "${REPO}:${TAG}"
  docker push "${REPO}:latest"

  echo "── Updating ECS service ${svc} ──"
  # Force new deployment so ECS pulls the fresh :latest image
  aws ecs update-service \
    --region "${AWS_REGION}" \
    --cluster "${CLUSTER}" \
    --service "${CLUSTER}-${svc}" \
    --force-new-deployment \
    --query "service.{status:status,desired:desiredCount}" \
    --output table
done

echo ""
echo "==> Waiting for services to stabilise (up to 10 min)…"
for svc in "${SVC_LIST[@]}"; do
  echo "    waiting on ${CLUSTER}-${svc}"
  aws ecs wait services-stable \
    --region "${AWS_REGION}" \
    --cluster "${CLUSTER}" \
    --services "${CLUSTER}-${svc}"
  echo "    ${svc} stable ✓"
done

echo ""
echo "==> Deploy complete. Run ./scripts/smoke-test-staging.sh to verify."
