variable "project"     { type = string }
variable "environment" { type = string }
variable "region_short" { type = string }
variable "account_id"  { type = string }

locals {
  prefix = "${var.project}-${var.environment}-${var.region_short}"
}

resource "aws_s3_bucket" "profile_images" {
  bucket = "${local.prefix}-profile-images-${var.account_id}"
  tags   = { Name = "${local.prefix}-profile-images", Purpose = "profile-images" }
}

resource "aws_s3_bucket" "data_exports" {
  bucket = "${local.prefix}-data-exports-${var.account_id}"
  tags   = { Name = "${local.prefix}-data-exports", Purpose = "gdpr-exports" }
}

resource "aws_s3_bucket_versioning" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_exports" {
  bucket = aws_s3_bucket.data_exports.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "profile_images" {
  bucket                  = aws_s3_bucket.profile_images.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "data_exports" {
  bucket                  = aws_s3_bucket.data_exports.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "data_exports" {
  bucket = aws_s3_bucket.data_exports.id
  rule {
    id     = "expire-exports"
    status = "Enabled"
    filter { prefix = "" }
    expiration { days = 7 }
  }
}

# CORS for profile images (frontend upload)
resource "aws_s3_bucket_cors_configuration" "profile_images" {
  bucket = aws_s3_bucket.profile_images.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"]
    max_age_seconds = 3600
  }
}

output "profile_images_bucket"     { value = aws_s3_bucket.profile_images.bucket }
output "profile_images_bucket_arn" { value = aws_s3_bucket.profile_images.arn }
output "data_exports_bucket"       { value = aws_s3_bucket.data_exports.bucket }
output "data_exports_bucket_arn"   { value = aws_s3_bucket.data_exports.arn }
