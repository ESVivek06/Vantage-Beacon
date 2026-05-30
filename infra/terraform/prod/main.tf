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
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

# ── Providers ────────────────────────────────────────────────────────────────
provider "aws" {
  alias  = "na"
  region = "us-east-1"
}

provider "aws" {
  alias  = "uk"
  region = "eu-west-2"
}

# us-east-1 is required for CloudFront ACM certs
provider "aws" {
  alias  = "us_east_1_global"
  region = "us-east-1"
}

locals {
  project     = "vb"
  environment = "production"

  db_password_uk = var.db_password_uk
  db_password_na = var.db_password_na

  service_list = ["web", "api", "ml"]

  # Per-region service definitions; image tags resolved at deploy time by CI
  services_uk = {
    web = {
      image         = "${module.ecr_uk.repository_urls["web"]}:latest"
      port          = 3000
      cpu           = 512
      memory        = 1024
      desired_count = 2
      health_check  = "/api/health"
      env_vars = {
        NODE_ENV    = "production"
        REGION      = "UK"
        NEXT_PUBLIC_API_URL = "https://api.vb.uk"
      }
      secret_arns = {
        NEXTAUTH_SECRET = aws_secretsmanager_secret_version.nextauth_secret_uk.arn
        DATABASE_URL    = aws_secretsmanager_secret_version.db_url_uk.arn
      }
    }
    api = {
      image         = "${module.ecr_uk.repository_urls["api"]}:latest"
      port          = 4000
      cpu           = 512
      memory        = 1024
      desired_count = 2
      health_check  = "/health"
      env_vars = {
        NODE_ENV = "production"
        REGION   = "UK"
        PORT     = "4000"
      }
      secret_arns = {
        DATABASE_URL    = aws_secretsmanager_secret_version.db_url_uk.arn
        REDIS_URL       = aws_secretsmanager_secret_version.redis_url_uk.arn
        JWT_SECRET      = aws_secretsmanager_secret_version.jwt_secret_uk.arn
        OPENAI_API_KEY  = aws_secretsmanager_secret_version.openai_key.arn
        S3_BUCKET       = aws_secretsmanager_secret_version.s3_bucket_uk.arn
      }
    }
    ml = {
      image         = "${module.ecr_uk.repository_urls["ml"]}:latest"
      port          = 8000
      cpu           = 1024
      memory        = 2048
      desired_count = 1
      health_check  = "/health"
      env_vars = {
        ENVIRONMENT = "production"
        REGION      = "UK"
      }
      secret_arns = {
        DATABASE_URL   = aws_secretsmanager_secret_version.db_url_uk.arn
        OPENAI_API_KEY = aws_secretsmanager_secret_version.openai_key.arn
      }
    }
  }

  services_na = {
    web = {
      image         = "${module.ecr_na.repository_urls["web"]}:latest"
      port          = 3000
      cpu           = 512
      memory        = 1024
      desired_count = 2
      health_check  = "/api/health"
      env_vars = {
        NODE_ENV    = "production"
        REGION      = "NA"
        NEXT_PUBLIC_API_URL = "https://api.vb.com"
      }
      secret_arns = {
        NEXTAUTH_SECRET = aws_secretsmanager_secret_version.nextauth_secret_na.arn
        DATABASE_URL    = aws_secretsmanager_secret_version.db_url_na.arn
      }
    }
    api = {
      image         = "${module.ecr_na.repository_urls["api"]}:latest"
      port          = 4000
      cpu           = 512
      memory        = 1024
      desired_count = 2
      health_check  = "/health"
      env_vars = {
        NODE_ENV = "production"
        REGION   = "NA"
        PORT     = "4000"
      }
      secret_arns = {
        DATABASE_URL    = aws_secretsmanager_secret_version.db_url_na.arn
        REDIS_URL       = aws_secretsmanager_secret_version.redis_url_na.arn
        JWT_SECRET      = aws_secretsmanager_secret_version.jwt_secret_na.arn
        OPENAI_API_KEY  = aws_secretsmanager_secret_version.openai_key.arn
        S3_BUCKET       = aws_secretsmanager_secret_version.s3_bucket_na.arn
      }
    }
    ml = {
      image         = "${module.ecr_na.repository_urls["ml"]}:latest"
      port          = 8000
      cpu           = 1024
      memory        = 2048
      desired_count = 1
      health_check  = "/health"
      env_vars = {
        ENVIRONMENT = "production"
        REGION      = "NA"
      }
      secret_arns = {
        DATABASE_URL   = aws_secretsmanager_secret_version.db_url_na.arn
        OPENAI_API_KEY = aws_secretsmanager_secret_version.openai_key.arn
      }
    }
  }
}

# ── Data ─────────────────────────────────────────────────────────────────────
data "aws_caller_identity" "current" {
  provider = aws.na
}

# ── ECR (per-region) ─────────────────────────────────────────────────────────
module "ecr_uk" {
  source      = "../modules/ecr"
  providers   = { aws = aws.uk }
  project     = local.project
  environment = local.environment
  services    = local.service_list
}

module "ecr_na" {
  source      = "../modules/ecr"
  providers   = { aws = aws.na }
  project     = local.project
  environment = local.environment
  services    = local.service_list
}

# ── VPC (per-region) ─────────────────────────────────────────────────────────
module "vpc_uk" {
  source      = "../modules/vpc"
  providers   = { aws = aws.uk }
  project     = local.project
  environment = local.environment
  region      = "uk"
  vpc_cidr    = "10.1.0.0/16"
}

module "vpc_na" {
  source      = "../modules/vpc"
  providers   = { aws = aws.na }
  project     = local.project
  environment = local.environment
  region      = "na"
  vpc_cidr    = "10.2.0.0/16"
}

# ── Secrets Manager ──────────────────────────────────────────────────────────
resource "aws_secretsmanager_secret" "db_url_uk" {
  provider = aws.uk
  name     = "/${local.project}/${local.environment}/uk/database-url"
}
resource "aws_secretsmanager_secret_version" "db_url_uk" {
  provider      = aws.uk
  secret_id     = aws_secretsmanager_secret.db_url_uk.id
  secret_string = "postgresql://${var.db_username}:${local.db_password_uk}@${module.rds_uk.endpoint}:5432/vb"
}

resource "aws_secretsmanager_secret" "db_url_na" {
  provider = aws.na
  name     = "/${local.project}/${local.environment}/na/database-url"
}
resource "aws_secretsmanager_secret_version" "db_url_na" {
  provider      = aws.na
  secret_id     = aws_secretsmanager_secret.db_url_na.id
  secret_string = "postgresql://${var.db_username}:${local.db_password_na}@${module.rds_na.endpoint}:5432/vb"
}

resource "aws_secretsmanager_secret" "redis_url_uk" {
  provider = aws.uk
  name     = "/${local.project}/${local.environment}/uk/redis-url"
}
resource "aws_secretsmanager_secret_version" "redis_url_uk" {
  provider      = aws.uk
  secret_id     = aws_secretsmanager_secret.redis_url_uk.id
  secret_string = var.upstash_redis_url_uk
}

resource "aws_secretsmanager_secret" "redis_url_na" {
  provider = aws.na
  name     = "/${local.project}/${local.environment}/na/redis-url"
}
resource "aws_secretsmanager_secret_version" "redis_url_na" {
  provider      = aws.na
  secret_id     = aws_secretsmanager_secret.redis_url_na.id
  secret_string = var.upstash_redis_url_na
}

resource "aws_secretsmanager_secret" "jwt_secret_uk" {
  provider = aws.uk
  name     = "/${local.project}/${local.environment}/uk/jwt-secret"
}
resource "aws_secretsmanager_secret_version" "jwt_secret_uk" {
  provider      = aws.uk
  secret_id     = aws_secretsmanager_secret.jwt_secret_uk.id
  secret_string = var.jwt_secret_uk
}

resource "aws_secretsmanager_secret" "jwt_secret_na" {
  provider = aws.na
  name     = "/${local.project}/${local.environment}/na/jwt-secret"
}
resource "aws_secretsmanager_secret_version" "jwt_secret_na" {
  provider      = aws.na
  secret_id     = aws_secretsmanager_secret.jwt_secret_na.id
  secret_string = var.jwt_secret_na
}

resource "aws_secretsmanager_secret" "nextauth_secret_uk" {
  provider = aws.uk
  name     = "/${local.project}/${local.environment}/uk/nextauth-secret"
}
resource "aws_secretsmanager_secret_version" "nextauth_secret_uk" {
  provider      = aws.uk
  secret_id     = aws_secretsmanager_secret.nextauth_secret_uk.id
  secret_string = var.nextauth_secret_uk
}

resource "aws_secretsmanager_secret" "nextauth_secret_na" {
  provider = aws.na
  name     = "/${local.project}/${local.environment}/na/nextauth-secret"
}
resource "aws_secretsmanager_secret_version" "nextauth_secret_na" {
  provider      = aws.na
  secret_id     = aws_secretsmanager_secret.nextauth_secret_na.id
  secret_string = var.nextauth_secret_na
}

resource "aws_secretsmanager_secret" "openai_key" {
  provider = aws.uk
  name     = "/${local.project}/${local.environment}/openai-api-key"
}
resource "aws_secretsmanager_secret_version" "openai_key" {
  provider      = aws.uk
  secret_id     = aws_secretsmanager_secret.openai_key.id
  secret_string = var.openai_api_key
}

resource "aws_secretsmanager_secret" "datadog_api_key_uk" {
  provider = aws.uk
  name     = "/${local.project}/${local.environment}/uk/datadog-api-key"
}
resource "aws_secretsmanager_secret_version" "datadog_api_key_uk" {
  provider      = aws.uk
  secret_id     = aws_secretsmanager_secret.datadog_api_key_uk.id
  secret_string = var.datadog_api_key
}

resource "aws_secretsmanager_secret" "datadog_api_key_na" {
  provider = aws.na
  name     = "/${local.project}/${local.environment}/na/datadog-api-key"
}
resource "aws_secretsmanager_secret_version" "datadog_api_key_na" {
  provider      = aws.na
  secret_id     = aws_secretsmanager_secret.datadog_api_key_na.id
  secret_string = var.datadog_api_key
}

resource "aws_secretsmanager_secret" "s3_bucket_uk" {
  provider = aws.uk
  name     = "/${local.project}/${local.environment}/uk/s3-bucket"
}
resource "aws_secretsmanager_secret_version" "s3_bucket_uk" {
  provider      = aws.uk
  secret_id     = aws_secretsmanager_secret.s3_bucket_uk.id
  secret_string = module.s3_uk.profile_images_bucket
}

resource "aws_secretsmanager_secret" "s3_bucket_na" {
  provider = aws.na
  name     = "/${local.project}/${local.environment}/na/s3-bucket"
}
resource "aws_secretsmanager_secret_version" "s3_bucket_na" {
  provider      = aws.na
  secret_id     = aws_secretsmanager_secret.s3_bucket_na.id
  secret_string = module.s3_na.profile_images_bucket
}

# ── RDS (per-region) ─────────────────────────────────────────────────────────
module "rds_uk" {
  source            = "../modules/rds"
  providers         = { aws = aws.uk }
  project           = local.project
  environment       = local.environment
  region_short      = "uk"
  subnet_ids        = module.vpc_uk.private_subnet_ids
  security_group_id = module.vpc_uk.sg_rds_id
  instance_class    = "db.t3.medium"
  multi_az          = true
  db_password       = local.db_password_uk
  db_username       = var.db_username
}

module "rds_na" {
  source            = "../modules/rds"
  providers         = { aws = aws.na }
  project           = local.project
  environment       = local.environment
  region_short      = "na"
  subnet_ids        = module.vpc_na.private_subnet_ids
  security_group_id = module.vpc_na.sg_rds_id
  instance_class    = "db.t3.medium"
  multi_az          = true
  db_password       = local.db_password_na
  db_username       = var.db_username
}

# Global metadata RDS in eu-west-2
module "rds_global" {
  source            = "../modules/rds"
  providers         = { aws = aws.uk }
  project           = local.project
  environment       = local.environment
  region_short      = "global"
  subnet_ids        = module.vpc_uk.private_subnet_ids
  security_group_id = module.vpc_uk.sg_rds_id
  instance_class    = "db.t3.small"
  multi_az          = false
  db_name           = "vb_global"
  db_password       = var.db_password_global
  db_username       = var.db_username
}

# ── S3 (per-region) ──────────────────────────────────────────────────────────
module "s3_uk" {
  source       = "../modules/s3"
  providers    = { aws = aws.uk }
  project      = local.project
  environment  = local.environment
  region_short = "uk"
  account_id   = data.aws_caller_identity.current.account_id
}

module "s3_na" {
  source       = "../modules/s3"
  providers    = { aws = aws.na }
  project      = local.project
  environment  = local.environment
  region_short = "na"
  account_id   = data.aws_caller_identity.current.account_id
}

# ── ECS (per-region) ─────────────────────────────────────────────────────────
module "ecs_uk" {
  source               = "../modules/ecs"
  providers            = { aws = aws.uk }
  project              = local.project
  environment          = local.environment
  region_short         = "uk"
  aws_region           = "eu-west-2"
  vpc_id               = module.vpc_uk.vpc_id
  public_subnet_ids    = module.vpc_uk.public_subnet_ids
  private_subnet_ids   = module.vpc_uk.private_subnet_ids
  sg_alb_id            = module.vpc_uk.sg_alb_id
  sg_ecs_id            = module.vpc_uk.sg_ecs_id
  datadog_api_key_arn  = aws_secretsmanager_secret_version.datadog_api_key_uk.arn
  certificate_arn      = var.acm_cert_arn_uk
  services             = local.services_uk
  depends_on           = [module.rds_uk, module.s3_uk]
}

module "ecs_na" {
  source               = "../modules/ecs"
  providers            = { aws = aws.na }
  project              = local.project
  environment          = local.environment
  region_short         = "na"
  aws_region           = "us-east-1"
  vpc_id               = module.vpc_na.vpc_id
  public_subnet_ids    = module.vpc_na.public_subnet_ids
  private_subnet_ids   = module.vpc_na.private_subnet_ids
  sg_alb_id            = module.vpc_na.sg_alb_id
  sg_ecs_id            = module.vpc_na.sg_ecs_id
  datadog_api_key_arn  = aws_secretsmanager_secret_version.datadog_api_key_na.arn
  certificate_arn      = var.acm_cert_arn_na
  services             = local.services_na
  depends_on           = [module.rds_na, module.s3_na]
}

# ── SES (email domain verification) ─────────────────────────────────────────
resource "aws_ses_domain_identity" "main" {
  provider = aws.uk
  domain   = var.email_domain
}

resource "aws_ses_domain_dkim" "main" {
  provider = aws.uk
  domain   = aws_ses_domain_identity.main.domain
}

resource "aws_ses_domain_mail_from" "main" {
  provider         = aws.uk
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "mail.${var.email_domain}"
}
