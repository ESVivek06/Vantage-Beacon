output "alb_dns_uk" {
  value = module.ecs_uk.alb_dns_name
}

output "alb_dns_na" {
  value = module.ecs_na.alb_dns_name
}

output "rds_endpoint_uk" {
  value     = module.rds_uk.endpoint
  sensitive = true
}

output "rds_endpoint_na" {
  value     = module.rds_na.endpoint
  sensitive = true
}

output "rds_endpoint_global" {
  value     = module.rds_global.endpoint
  sensitive = true
}

output "s3_profile_images_uk" {
  value = module.s3_uk.profile_images_bucket
}

output "s3_profile_images_na" {
  value = module.s3_na.profile_images_bucket
}

output "ecr_urls_uk" {
  value = module.ecr_uk.repository_urls
}

output "ecr_urls_na" {
  value = module.ecr_na.repository_urls
}

output "ses_dkim_tokens" {
  value = aws_ses_domain_dkim.main.dkim_tokens
}
