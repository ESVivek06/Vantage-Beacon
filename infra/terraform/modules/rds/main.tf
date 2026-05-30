variable "project"           { type = string }
variable "environment"       { type = string }
variable "region_short"      { type = string }
variable "subnet_ids"        { type = list(string) }
variable "security_group_id" { type = string }
variable "instance_class"    { default = "db.t3.medium" }
variable "multi_az"          { default = false }
variable "db_name"           { default = "vb" }
variable "db_username"       { default = "vbadmin" }
variable "db_password"       { type = string; sensitive = true }
variable "allocated_storage" { default = 50 }

locals {
  name = "${var.project}-${var.environment}-${var.region_short}"
}

resource "aws_db_subnet_group" "this" {
  name       = "${local.name}-rds"
  subnet_ids = var.subnet_ids
  tags       = { Name = "${local.name}-rds" }
}

resource "aws_db_parameter_group" "this" {
  name   = "${local.name}-pg16"
  family = "postgres16"

  parameter {
    name  = "shared_preload_libraries"
    value = "vector"
  }

  tags = { Name = "${local.name}-pg16" }
}

resource "aws_db_instance" "this" {
  identifier             = "${local.name}-rds"
  engine                 = "postgres"
  engine_version         = "16.3"
  instance_class         = var.instance_class
  allocated_storage      = var.allocated_storage
  max_allocated_storage  = 200
  storage_encrypted      = true
  storage_type           = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  parameter_group_name   = aws_db_parameter_group.this.name
  vpc_security_group_ids = [var.security_group_id]

  multi_az               = var.multi_az
  skip_final_snapshot    = false
  final_snapshot_identifier = "${local.name}-final-snapshot"
  deletion_protection    = var.environment == "production" ? true : false
  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  performance_insights_enabled = var.environment == "production" ? true : false

  tags = { Name = "${local.name}-rds", Environment = var.environment }
}

output "endpoint"         { value = aws_db_instance.this.address }
output "port"             { value = aws_db_instance.this.port }
output "db_name"          { value = aws_db_instance.this.db_name }
output "connection_string" {
  value     = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.this.address}:${aws_db_instance.this.port}/${var.db_name}"
  sensitive = true
}
