variable "project"     { type = string }
variable "environment" { type = string }
variable "services"    { type = list(string) }

resource "aws_ecr_repository" "services" {
  for_each             = toset(var.services)
  name                 = "${var.project}/${var.environment}/${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = { Name = "${var.project}-${var.environment}-${each.key}" }
}

resource "aws_ecr_lifecycle_policy" "services" {
  for_each   = aws_ecr_repository.services
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 production images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Remove untagged images older than 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      }
    ]
  })
}

output "repository_urls" {
  value = { for k, r in aws_ecr_repository.services : k => r.repository_url }
}
output "registry_id" {
  value = length(aws_ecr_repository.services) > 0 ? values(aws_ecr_repository.services)[0].registry_id : ""
}
