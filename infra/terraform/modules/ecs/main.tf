variable "project"              { type = string }
variable "environment"          { type = string }
variable "region_short"         { type = string }
variable "vpc_id"               { type = string }
variable "public_subnet_ids"    { type = list(string) }
variable "private_subnet_ids"   { type = list(string) }
variable "sg_alb_id"            { type = string }
variable "sg_ecs_id"            { type = string }
variable "aws_region"           { type = string }
variable "datadog_api_key_arn"  { type = string }
variable "certificate_arn"      { type = string; default = "" }

variable "services" {
  description = "Map of service name → {image, port, cpu, memory, env_vars, secrets}"
  type = map(object({
    image          = string
    port           = number
    cpu            = number
    memory         = number
    desired_count  = number
    health_check   = string
    env_vars       = map(string)
    secret_arns    = map(string)
  }))
}

locals {
  name = "${var.project}-${var.environment}-${var.region_short}"
}

# ECS Cluster
resource "aws_ecs_cluster" "this" {
  name = local.name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = { Name = local.name }
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name       = aws_ecs_cluster.this.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}

# Task Execution Role
resource "aws_iam_role" "task_execution" {
  name = "${local.name}-task-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_execution_secrets" {
  name = "${local.name}-secrets"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue", "ssm:GetParameters", "kms:Decrypt"]
      Resource = "*"
    }]
  })
}

# Task Role (for S3, SES, etc.)
resource "aws_iam_role" "task" {
  name = "${local.name}-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "task_s3_ses" {
  name = "${local.name}-s3-ses"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "services" {
  for_each          = var.services
  name              = "/ecs/${local.name}/${each.key}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "datadog" {
  name              = "/ecs/${local.name}/datadog-agent"
  retention_in_days = 14
}

# ALB
resource "aws_lb" "this" {
  name               = "${local.name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.sg_alb_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "production" ? true : false

  tags = { Name = "${local.name}-alb" }
}

resource "aws_lb_target_group" "services" {
  for_each = var.services

  name        = "${local.name}-${each.key}"
  port        = each.value.port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = each.value.health_check
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 10
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  count             = var.certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["api"].arn
  }
}

resource "aws_lb_listener_rule" "web" {
  count        = var.certificate_arn != "" ? 1 : 0
  listener_arn = aws_lb_listener.https[0].arn
  priority     = 100

  condition {
    path_pattern { values = ["/", "/*"] }
  }
  condition {
    host_header { values = ["app.*", "www.*"] }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["web"].arn
  }
}

# ECS Task Definitions
resource "aws_ecs_task_definition" "services" {
  for_each = var.services

  family                   = "${local.name}-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = each.key
      image     = each.value.image
      essential = true
      portMappings = [{
        containerPort = each.value.port
        protocol      = "tcp"
      }]
      environment = [
        for k, v in each.value.env_vars : { name = k, value = v }
      ]
      secrets = [
        for k, arn in each.value.secret_arns : { name = k, valueFrom = arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${local.name}/${each.key}"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    },
    {
      name      = "datadog-agent"
      image     = "public.ecr.aws/datadog/agent:7"
      essential = false
      environment = [
        { name = "DD_SITE", value = "datadoghq.com" },
        { name = "ECS_FARGATE", value = "true" },
        { name = "DD_APM_ENABLED", value = "true" },
        { name = "DD_LOGS_ENABLED", value = "true" },
        { name = "DD_PROCESS_AGENT_ENABLED", value = "true" },
        { name = "DD_ENV", value = var.environment },
        { name = "DD_SERVICE", value = each.key },
        { name = "DD_VERSION", value = "latest" }
      ]
      secrets = [{
        name      = "DD_API_KEY"
        valueFrom = var.datadog_api_key_arn
      }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/${local.name}/datadog-agent"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

# ECS Services
resource "aws_ecs_service" "services" {
  for_each = var.services

  name            = "${local.name}-${each.key}"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = each.value.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.sg_ecs_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services[each.key].arn
    container_name   = each.key
    container_port   = each.value.port
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_controller {
    type = "ECS"
  }

  lifecycle {
    ignore_changes = [desired_count, task_definition]
  }

  depends_on = [aws_lb_listener.http]
}

output "cluster_name"  { value = aws_ecs_cluster.this.name }
output "cluster_arn"   { value = aws_ecs_cluster.this.arn }
output "alb_dns_name"  { value = aws_lb.this.dns_name }
output "alb_zone_id"   { value = aws_lb.this.zone_id }
output "service_names" { value = { for k, s in aws_ecs_service.services : k => s.name } }
