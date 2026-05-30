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
    key    = "global/terraform.tfstate"
    region = "us-east-1"
  }
}

# CloudFront ACM certs must be in us-east-1
provider "aws" {
  region = "us-east-1"
}

variable "environment"        { default = "production" }
variable "alb_dns_uk"         { type = string }
variable "alb_dns_na"         { type = string }
variable "s3_bucket_uk"       { type = string }
variable "s3_region_uk"       { default = "eu-west-2" }
variable "acm_certificate_arn" { type = string; description = "ACM cert in us-east-1 for CloudFront" }

locals {
  project = "vb"
}

# ── CloudFront Origin Access Control for S3 ──────────────────────────────────
resource "aws_cloudfront_origin_access_control" "s3" {
  name                              = "${local.project}-${var.environment}-s3-oac"
  description                       = "OAC for V.B S3 profile images"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ── CloudFront Distribution ───────────────────────────────────────────────────
resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  comment             = "V.B ${var.environment} — Next.js + S3"
  default_root_object = "/"
  price_class         = "PriceClass_100"
  http_version        = "http2and3"

  # Next.js web (UK ALB — primary; failover to NA via Route53 latency routing in DNS)
  origin {
    domain_name = var.alb_dns_uk
    origin_id   = "web-uk"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # S3 profile images (UK bucket — primary)
  origin {
    domain_name              = "${var.s3_bucket_uk}.s3.${var.s3_region_uk}.amazonaws.com"
    origin_id                = "s3-images"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3.id
  }

  # Default: proxy to Next.js
  default_cache_behavior {
    target_origin_id       = "web-uk"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = true
      headers      = ["Host", "Origin", "Authorization"]
      cookies { forward = "all" }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 31536000
  }

  # Static assets: long cache
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = "web-uk"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 86400
    default_ttl = 604800
    max_ttl     = 31536000
  }

  # S3 images
  ordered_cache_behavior {
    path_pattern           = "/images/*"
    target_origin_id       = "s3-images"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 3600
    default_ttl = 86400
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = { Name = "${local.project}-${var.environment}-cdn" }
}

output "cloudfront_domain"           { value = aws_cloudfront_distribution.main.domain_name }
output "cloudfront_distribution_id"  { value = aws_cloudfront_distribution.main.id }
