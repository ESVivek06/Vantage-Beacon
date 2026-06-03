variable "db_username" {
  type    = string
  default = "vbadmin"
}

variable "db_password_uk" {
  type      = string
  sensitive = true
}

variable "db_password_na" {
  type      = string
  sensitive = true
}

variable "db_password_global" {
  type      = string
  sensitive = true
}

variable "jwt_secret_uk" {
  type      = string
  sensitive = true
}

variable "jwt_secret_na" {
  type      = string
  sensitive = true
}

variable "nextauth_secret_uk" {
  type      = string
  sensitive = true
}

variable "nextauth_secret_na" {
  type      = string
  sensitive = true
}

variable "upstash_redis_url_uk" {
  type      = string
  sensitive = true
}

variable "upstash_redis_url_na" {
  type      = string
  sensitive = true
}

variable "openai_api_key" {
  type      = string
  sensitive = true
}

variable "datadog_api_key" {
  type      = string
  sensitive = true
}

variable "datadog_app_key" {
  type        = string
  sensitive   = true
  description = "Datadog Application Key — required by the Terraform provider to manage monitors."
}

variable "datadog_slack_handle" {
  type        = string
  default     = "@slack-ops-alerts"
  description = "Datadog Slack notification handle for #ops-alerts channel (e.g. '@slack-ops-alerts')."
}

variable "datadog_pagerduty_handle" {
  type        = string
  default     = "@pagerduty"
  description = "Datadog PagerDuty notification handle for critical alerts (e.g. '@pagerduty-vb')."
}

variable "email_domain" {
  type    = string
  default = "vb.com"
}

variable "acm_cert_arn_uk" {
  type    = string
  default = ""
}

variable "acm_cert_arn_na" {
  type    = string
  default = ""
}
