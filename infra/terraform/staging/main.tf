terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "vb-terraform-state"
    key    = "staging/terraform.tfstate"
    region = "us-east-1"
  }
}

# Staging uses only eu-west-2 (single region, cost-optimised)
provider "aws" {
  region = "eu-west-2"
}

variable "environment" { default = "staging" }
variable "db_password" { type = string; sensitive = true }
variable "db_username" { type = string; default = "vbadmin" }
variable "jwt_secret"  { type = string; sensitive = true }
variable "nextauth_secret" { type = string; sensitive = true }
variable "auth_secret"     { type = string; sensitive = true }
variable "upstash_redis_url"         { type = string; sensitive = true }
variable "upstash_redis_rest_url"    { type = string; sensitive = true }
variable "upstash_redis_rest_token"  { type = string; sensitive = true }
variable "openai_api_key"            { type = string; sensitive = true }
variable "datadog_api_key"           { type = string; sensitive = true }
variable "unsubscribe_secret"        { type = string; sensitive = true }
variable "google_client_id"          { type = string; sensitive = true }
variable "google_client_secret"      { type = string; sensitive = true }
variable "linkedin_client_id"        { type = string; sensitive = true }
variable "linkedin_client_secret"    { type = string; sensitive = true }
variable "ses_from_address"    { type = string; default = "noreply@staging.vb.com" }
variable "app_url"             { type = string; default = "https://app.staging.vb.com" }
variable "ml_service_url"      { type = string; default = "" }
variable "acm_cert_arn"        { type = string; default = "" }

locals {
  project = "vb"
}

data "aws_caller_identity" "current" {}

# ── ECR ──────────────────────────────────────────────────────────────────────
module "ecr" {
  source      = "../modules/ecr"
  project     = local.project
  environment = local.environment
  services    = ["web", "api", "ml"]
}

# ── VPC ──────────────────────────────────────────────────────────────────────
module "vpc" {
  source      = "../modules/vpc"
  project     = local.project
  environment = local.environment
  region      = "uk"
  vpc_cidr    = "10.10.0.0/16"
  az_count    = 2
}

# ── Secrets ──────────────────────────────────────────────────────────────────
resource "aws_secretsmanager_secret" "db_url" {
  name = "/${local.project}/${local.environment}/database-url"
}
resource "aws_secretsmanager_secret_version" "db_url" {
  secret_id     = aws_secretsmanager_secret.db_url.id
  secret_string = "postgresql://${var.db_username}:${var.db_password}@${module.rds.endpoint}:5432/vb"
}

resource "aws_secretsmanager_secret" "redis_url" {
  name = "/${local.project}/${local.environment}/redis-url"
}
resource "aws_secretsmanager_secret_version" "redis_url" {
  secret_id     = aws_secretsmanager_secret.redis_url.id
  secret_string = var.upstash_redis_url
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "/${local.project}/${local.environment}/jwt-secret"
}
resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret
}

resource "aws_secretsmanager_secret" "nextauth_secret" {
  name = "/${local.project}/${local.environment}/nextauth-secret"
}
resource "aws_secretsmanager_secret_version" "nextauth_secret" {
  secret_id     = aws_secretsmanager_secret.nextauth_secret.id
  secret_string = var.nextauth_secret
}

resource "aws_secretsmanager_secret" "openai_key" {
  name = "/${local.project}/${local.environment}/openai-api-key"
}
resource "aws_secretsmanager_secret_version" "openai_key" {
  secret_id     = aws_secretsmanager_secret.openai_key.id
  secret_string = var.openai_api_key
}

resource "aws_secretsmanager_secret" "datadog_api_key" {
  name = "/${local.project}/${local.environment}/datadog-api-key"
}
resource "aws_secretsmanager_secret_version" "datadog_api_key" {
  secret_id     = aws_secretsmanager_secret.datadog_api_key.id
  secret_string = var.datadog_api_key
}

resource "aws_secretsmanager_secret" "s3_bucket" {
  name = "/${local.project}/${local.environment}/s3-bucket"
}
resource "aws_secretsmanager_secret_version" "s3_bucket" {
  secret_id     = aws_secretsmanager_secret.s3_bucket.id
  secret_string = module.s3.profile_images_bucket
}

resource "aws_secretsmanager_secret" "auth_secret" {
  name = "/${local.project}/${local.environment}/auth-secret"
}
resource "aws_secretsmanager_secret_version" "auth_secret" {
  secret_id     = aws_secretsmanager_secret.auth_secret.id
  secret_string = var.auth_secret
}

resource "aws_secretsmanager_secret" "unsubscribe_secret" {
  name = "/${local.project}/${local.environment}/unsubscribe-secret"
}
resource "aws_secretsmanager_secret_version" "unsubscribe_secret" {
  secret_id     = aws_secretsmanager_secret.unsubscribe_secret.id
  secret_string = var.unsubscribe_secret
}

resource "aws_secretsmanager_secret" "upstash_redis_rest_url" {
  name = "/${local.project}/${local.environment}/upstash-redis-rest-url"
}
resource "aws_secretsmanager_secret_version" "upstash_redis_rest_url" {
  secret_id     = aws_secretsmanager_secret.upstash_redis_rest_url.id
  secret_string = var.upstash_redis_rest_url
}

resource "aws_secretsmanager_secret" "upstash_redis_rest_token" {
  name = "/${local.project}/${local.environment}/upstash-redis-rest-token"
}
resource "aws_secretsmanager_secret_version" "upstash_redis_rest_token" {
  secret_id     = aws_secretsmanager_secret.upstash_redis_rest_token.id
  secret_string = var.upstash_redis_rest_token
}

resource "aws_secretsmanager_secret" "google_client_id" {
  name = "/${local.project}/${local.environment}/google-client-id"
}
resource "aws_secretsmanager_secret_version" "google_client_id" {
  secret_id     = aws_secretsmanager_secret.google_client_id.id
  secret_string = var.google_client_id
}

resource "aws_secretsmanager_secret" "google_client_secret" {
  name = "/${local.project}/${local.environment}/google-client-secret"
}
resource "aws_secretsmanager_secret_version" "google_client_secret" {
  secret_id     = aws_secretsmanager_secret.google_client_secret.id
  secret_string = var.google_client_secret
}

resource "aws_secretsmanager_secret" "linkedin_client_id" {
  name = "/${local.project}/${local.environment}/linkedin-client-id"
}
resource "aws_secretsmanager_secret_version" "linkedin_client_id" {
  secret_id     = aws_secretsmanager_secret.linkedin_client_id.id
  secret_string = var.linkedin_client_id
}

resource "aws_secretsmanager_secret" "linkedin_client_secret" {
  name = "/${local.project}/${local.environment}/linkedin-client-secret"
}
resource "aws_secretsmanager_secret_version" "linkedin_client_secret" {
  secret_id     = aws_secretsmanager_secret.linkedin_client_secret.id
  secret_string = var.linkedin_client_secret
}

# ── RDS ──────────────────────────────────────────────────────────────────────
module "rds" {
  source            = "../modules/rds"
  project           = local.project
  environment       = local.environment
  region_short      = "uk"
  subnet_ids        = module.vpc.private_subnet_ids
  security_group_id = module.vpc.sg_rds_id
  instance_class    = "db.t3.micro"
  multi_az          = false
  db_password       = var.db_password
  db_username       = var.db_username
  allocated_storage = 20
}

# ── S3 ───────────────────────────────────────────────────────────────────────
module "s3" {
  source       = "../modules/s3"
  project      = local.project
  environment  = local.environment
  region_short = "uk"
  account_id   = data.aws_caller_identity.current.account_id
}

# ── ECS ──────────────────────────────────────────────────────────────────────
module "ecs" {
  source              = "../modules/ecs"
  project             = local.project
  environment         = local.environment
  region_short        = "uk"
  aws_region          = "eu-west-2"
  vpc_id              = module.vpc.vpc_id
  public_subnet_ids   = module.vpc.public_subnet_ids
  private_subnet_ids  = module.vpc.private_subnet_ids
  sg_alb_id           = module.vpc.sg_alb_id
  sg_ecs_id           = module.vpc.sg_ecs_id
  datadog_api_key_arn = aws_secretsmanager_secret_version.datadog_api_key.arn
  certificate_arn     = var.acm_cert_arn
  services = {
    web = {
      image         = "${module.ecr.repository_urls["web"]}:latest"
      port          = 3000
      cpu           = 256
      memory        = 512
      desired_count = 1
      health_check  = "/api/health"
      env_vars = {
        NODE_ENV               = "staging"
        REGION                 = "UK"
        NEXT_PUBLIC_API_URL    = "https://api.staging.vb.com"
        ML_SERVICE_URL         = var.ml_service_url
        WAITLIST_MODE          = "false"
      }
      secret_arns = {
        NEXTAUTH_SECRET            = aws_secretsmanager_secret_version.nextauth_secret.arn
        AUTH_SECRET                = aws_secretsmanager_secret_version.auth_secret.arn
        DATABASE_URL               = aws_secretsmanager_secret_version.db_url.arn
        DATABASE_URL_UK            = aws_secretsmanager_secret_version.db_url.arn
        UPSTASH_REDIS_REST_URL     = aws_secretsmanager_secret_version.upstash_redis_rest_url.arn
        UPSTASH_REDIS_REST_TOKEN   = aws_secretsmanager_secret_version.upstash_redis_rest_token.arn
        GOOGLE_CLIENT_ID           = aws_secretsmanager_secret_version.google_client_id.arn
        GOOGLE_CLIENT_SECRET       = aws_secretsmanager_secret_version.google_client_secret.arn
        LINKEDIN_CLIENT_ID         = aws_secretsmanager_secret_version.linkedin_client_id.arn
        LINKEDIN_CLIENT_SECRET     = aws_secretsmanager_secret_version.linkedin_client_secret.arn
      }
    }
    api = {
      image         = "${module.ecr.repository_urls["api"]}:latest"
      port          = 4000
      cpu           = 256
      memory        = 512
      desired_count = 1
      health_check  = "/health"
      env_vars = {
        NODE_ENV         = "staging"
        REGION           = "UK"
        DEFAULT_REGION   = "UK"
        PORT             = "4000"
        AWS_REGION       = "eu-west-2"
        APP_URL          = var.app_url
        SES_FROM_ADDRESS = var.ses_from_address
        ML_SERVICE_URL   = var.ml_service_url
        S3_BUCKET_URL    = "https://${module.s3.profile_images_bucket}.s3.eu-west-2.amazonaws.com"
        GDPR_EXPORT_BUCKET = module.s3.data_exports_bucket
      }
      secret_arns = {
        DATABASE_URL    = aws_secretsmanager_secret_version.db_url.arn
        DATABASE_URL_UK = aws_secretsmanager_secret_version.db_url.arn
        # Staging is single-region; NA and IN alias to UK DB
        DATABASE_URL_NA = aws_secretsmanager_secret_version.db_url.arn
        DATABASE_URL_IN = aws_secretsmanager_secret_version.db_url.arn
        REDIS_URL       = aws_secretsmanager_secret_version.redis_url.arn
        JWT_SECRET      = aws_secretsmanager_secret_version.jwt_secret.arn
        AUTH_SECRET     = aws_secretsmanager_secret_version.auth_secret.arn
        OPENAI_API_KEY  = aws_secretsmanager_secret_version.openai_key.arn
        # S3_BUCKET_NAME is what the API's s3.service.ts reads (throws if empty)
        S3_BUCKET_NAME  = aws_secretsmanager_secret_version.s3_bucket.arn
        S3_BUCKET       = aws_secretsmanager_secret_version.s3_bucket.arn
        UNSUBSCRIBE_SECRET = aws_secretsmanager_secret_version.unsubscribe_secret.arn
      }
    }
    ml = {
      image         = "${module.ecr.repository_urls["ml"]}:latest"
      port          = 8000
      cpu           = 512
      memory        = 1024
      desired_count = 1
      health_check  = "/health"
      env_vars = {
        ENVIRONMENT = "staging"
        REGION      = "UK"
      }
      secret_arns = {
        DATABASE_URL   = aws_secretsmanager_secret_version.db_url.arn
        OPENAI_API_KEY = aws_secretsmanager_secret_version.openai_key.arn
      }
    }
  }
  depends_on = [module.rds, module.s3]
}

# ── DNS ──────────────────────────────────────────────────────────────────────
variable "hosted_zone_name" { type = string; default = "vb.com" }

data "aws_route53_zone" "main" {
  name         = var.hosted_zone_name
  private_zone = false
}

# api.staging.vb.com → ALB (API is the default target, port 443)
resource "aws_route53_record" "api_staging" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "api.staging.${var.hosted_zone_name}"
  type    = "A"

  alias {
    name                   = module.ecs.alb_dns_name
    zone_id                = module.ecs.alb_zone_id
    evaluate_target_health = true
  }
}

# app.staging.vb.com → ALB (listener rule routes app.* to web service)
resource "aws_route53_record" "app_staging" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "app.staging.${var.hosted_zone_name}"
  type    = "A"

  alias {
    name                   = module.ecs.alb_dns_name
    zone_id                = module.ecs.alb_zone_id
    evaluate_target_health = true
  }
}

output "alb_dns"        { value = module.ecs.alb_dns_name }
output "ml_service_url" { value = "http://${module.ecs.alb_dns_name}:8000" }
output "ecr_urls"       { value = module.ecr.repository_urls }
output "rds_endpoint"   { value = module.rds.endpoint; sensitive = true }
output "s3_images"      { value = module.s3.profile_images_bucket }
