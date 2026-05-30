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
