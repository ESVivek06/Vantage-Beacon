# GitHub Actions OIDC trust — replaces long-lived AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
# Apply once with admin credentials: terraform -chdir=infra/terraform/global apply
# After apply, set AWS_OIDC_ROLE_ARN in GitHub repo/environment secrets to the role_arn output.

locals {
  github_oidc_url  = "https://token.actions.githubusercontent.com"
  github_repo      = "ESVivek06/Vantage-Beacon"
  aws_account_id   = "345307375390"
}

resource "aws_iam_openid_connect_provider" "github_actions" {
  url = local.github_oidc_url

  client_id_list = ["sts.amazonaws.com"]

  # AWS validates the OIDC provider cert using these thumbprints.
  # Include both the intermediate and the current leaf thumbprint for resilience.
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "227203b5317f3818cab5b5ce596132bf36748c0e",
  ]

  tags = { Name = "github-actions-oidc" }
}

data "aws_iam_policy_document" "github_actions_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github_actions.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${local.github_repo}:*"]
    }
  }
}

resource "aws_iam_role" "github_actions_deploy" {
  name               = "vb-github-actions-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_actions_trust.json
  description        = "Assumed by GitHub Actions via OIDC for CI/CD deployments"

  tags = { Name = "vb-github-actions-deploy" }
}

data "aws_iam_policy_document" "github_actions_deploy" {
  # ECR auth token (account-wide, no resource restriction possible)
  statement {
    sid     = "ECRAuth"
    effect  = "Allow"
    actions = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  # ECR image push/pull for all VB repositories in eu-west-2
  statement {
    sid    = "ECRPushPullUK"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:CreateRepository",
      "ecr:DescribeRepositories",
    ]
    resources = ["arn:aws:ecr:eu-west-2:${local.aws_account_id}:repository/vb/*"]
  }

  # ECR image push/pull for all VB repositories in us-east-1 (NA cross-replication)
  statement {
    sid    = "ECRPushPullNA"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "ecr:PutImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:CreateRepository",
      "ecr:DescribeRepositories",
    ]
    resources = ["arn:aws:ecr:us-east-1:${local.aws_account_id}:repository/vb/*"]
  }

  # ECS deploy operations — staging cluster
  statement {
    sid    = "ECSDeployStaging"
    effect = "Allow"
    actions = [
      "ecs:UpdateService",
      "ecs:RunTask",
      "ecs:DescribeTasks",
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
    ]
    resources = [
      "arn:aws:ecs:eu-west-2:${local.aws_account_id}:cluster/vb-staging-uk",
      "arn:aws:ecs:eu-west-2:${local.aws_account_id}:service/vb-staging-uk/*",
      "arn:aws:ecs:eu-west-2:${local.aws_account_id}:task/vb-staging-uk/*",
      "arn:aws:ecs:eu-west-2:${local.aws_account_id}:task-definition/vb-staging-uk-*:*",
    ]
  }

  # ECS deploy operations — production UK cluster
  statement {
    sid    = "ECSDeployProdUK"
    effect = "Allow"
    actions = [
      "ecs:UpdateService",
      "ecs:RunTask",
      "ecs:DescribeTasks",
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
    ]
    resources = [
      "arn:aws:ecs:eu-west-2:${local.aws_account_id}:cluster/vb-production-uk",
      "arn:aws:ecs:eu-west-2:${local.aws_account_id}:service/vb-production-uk/*",
      "arn:aws:ecs:eu-west-2:${local.aws_account_id}:task/vb-production-uk/*",
      "arn:aws:ecs:eu-west-2:${local.aws_account_id}:task-definition/vb-production-uk-*:*",
    ]
  }

  # ECS deploy operations — production NA cluster
  statement {
    sid    = "ECSDeployProdNA"
    effect = "Allow"
    actions = [
      "ecs:UpdateService",
      "ecs:RunTask",
      "ecs:DescribeTasks",
      "ecs:DescribeServices",
      "ecs:DescribeTaskDefinition",
    ]
    resources = [
      "arn:aws:ecs:us-east-1:${local.aws_account_id}:cluster/vb-production-na",
      "arn:aws:ecs:us-east-1:${local.aws_account_id}:service/vb-production-na/*",
      "arn:aws:ecs:us-east-1:${local.aws_account_id}:task/vb-production-na/*",
      "arn:aws:ecs:us-east-1:${local.aws_account_id}:task-definition/vb-production-na-*:*",
    ]
  }

  # iam:PassRole is required for ecs:RunTask (passes task execution role to ECS)
  statement {
    sid    = "PassECSTaskRole"
    effect = "Allow"
    actions = ["iam:PassRole"]
    resources = ["arn:aws:iam::${local.aws_account_id}:role/vb-*-task-*"]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }

  # CloudFront cache invalidation after production deploy
  statement {
    sid    = "CloudFrontInvalidate"
    effect = "Allow"
    actions = ["cloudfront:CreateInvalidation"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "vb-github-actions-deploy-policy"
  role   = aws_iam_role.github_actions_deploy.id
  policy = data.aws_iam_policy_document.github_actions_deploy.json
}

output "github_actions_role_arn" {
  description = "Set this as AWS_OIDC_ROLE_ARN in GitHub repo/environment secrets"
  value       = aws_iam_role.github_actions_deploy.arn
}
