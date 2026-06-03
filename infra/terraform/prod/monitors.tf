# ── Datadog Launch-Week Monitors ──────────────────────────────────────────────
# All 7 monitors required before 2026-06-05 launch (VAN-59).
#
# Custom metrics (signup funnel, auth failures, daily registrations) require
# app-level instrumentation emitting `vb.*` StatsD/DogStatsD metrics. See
# inline comments for each monitor.
#
# Deploy:  cd infra/terraform/prod && terraform apply -target=datadog_monitor.*
# Verify:  terraform output datadog_monitor_urls
# ─────────────────────────────────────────────────────────────────────────────

locals {
  slack_notify     = var.datadog_slack_handle     # e.g. "@slack-ops-alerts"
  pagerduty_notify = var.datadog_pagerduty_handle # e.g. "@pagerduty-vb"
  monitor_tags     = ["env:production", "team:ops", "launch-week:true"]
}

# ── 1. Error Rate ─────────────────────────────────────────────────────────────
# Triggers when HTTP error rate > 1% over any 5-min window.
# Uses Datadog APM trace metrics auto-collected by the agent sidecar.
resource "datadog_monitor" "error_rate" {
  name    = "[VB Production] API Error Rate > 1%"
  type    = "query alert"
  message = <<-EOT
    API error rate has exceeded **1%** over the last 5 minutes.

    Current value: {{value}}%

    {{#is_alert}}:red_circle: Alert triggered at {{triggered_at}}{{/is_alert}}
    {{#is_recovery}}:large_green_circle: Recovered at {{recovered_at}}{{/is_recovery}}

    ${local.slack_notify}
  EOT

  # APM auto-metric: errors / total requests * 100
  query = "avg(last_5m):(sum:trace.express.request.errors{env:production,service:api}.as_count() / sum:trace.express.request.hits{env:production,service:api}.as_count()) * 100 > 1"

  monitor_thresholds {
    critical = 1.0
    warning  = 0.5
  }

  evaluation_delay  = 60
  notify_no_data    = false
  renotify_interval = 0

  tags = concat(local.monitor_tags, ["alert:error-rate"])
}

# ── 2. P95 API Latency ────────────────────────────────────────────────────────
# Triggers when P95 response time > 2 000 ms (= 2 000 000 000 ns) over 5 min.
# Datadog APM stores duration in nanoseconds.
resource "datadog_monitor" "p95_api_latency" {
  name    = "[VB Production] P95 API Latency > 2000ms"
  type    = "metric alert"
  message = <<-EOT
    P95 API latency has exceeded **2 000 ms** over the last 5 minutes.

    Current P95: {{value}}ns (~{{value_in_ms}}ms)

    {{#is_alert}}:red_circle: Alert triggered at {{triggered_at}}{{/is_alert}}
    {{#is_recovery}}:large_green_circle: Recovered at {{recovered_at}}{{/is_recovery}}

    ${local.slack_notify}
  EOT

  # 2000ms = 2_000_000_000 ns | warning at 1500ms = 1_500_000_000 ns
  query = "avg(last_5m):p95:trace.express.request.duration{env:production,service:api} > 2000000000"

  monitor_thresholds {
    critical = 2000000000
    warning  = 1500000000
  }

  evaluation_delay  = 60
  notify_no_data    = false
  renotify_interval = 0

  tags = concat(local.monitor_tags, ["alert:latency"])
}

# ── 3. Sign-up Funnel Drop-off ────────────────────────────────────────────────
# Triggers when per-step conversion rate < 50% in first 24 hr after launch.
#
# Requires app instrumentation: emit a gauge metric after each funnel step:
#   statsd.gauge('vb.signup.conversion_rate', value, tags=['step:<name>'])
# where value = (users_at_step / users_at_previous_step) * 100
# Steps: landing, role_select, form_submit, email_verify, profile_complete
resource "datadog_monitor" "signup_funnel_dropoff" {
  name    = "[VB Production] Sign-up Funnel Conversion < 50% at any step"
  type    = "metric alert"
  message = <<-EOT
    Sign-up funnel conversion has dropped below **50%** at step: **{{step.name}}**

    Current conversion: {{value}}%

    Steps: landing → role_select → form_submit → email_verify → profile_complete

    {{#is_alert}}:red_circle: Alert triggered at {{triggered_at}}{{/is_alert}}
    {{#is_recovery}}:large_green_circle: Recovered at {{recovered_at}}{{/is_recovery}}

    ${local.pagerduty_notify}
  EOT

  query = "avg(last_30m):avg:vb.signup.conversion_rate{env:production} by {step} < 50"

  monitor_thresholds {
    critical = 50
    warning  = 65
  }

  evaluation_delay  = 60
  notify_no_data    = false
  renotify_interval = 60

  tags = concat(local.monitor_tags, ["alert:funnel", "team:product"])
}

# ── 4. Daily Registration Count ───────────────────────────────────────────────
# Triggers if total Day-1 sign-ups < 5 by end of day (rolling 24-hour window).
#
# Requires app instrumentation: increment counter on every successful registration:
#   statsd.increment('vb.user.registrations', tags=['env:production'])
resource "datadog_monitor" "daily_registrations" {
  name    = "[VB Production] Day-1 Registration Count < 5"
  type    = "metric alert"
  message = <<-EOT
    Only **{{value}}** registrations in the last 24 hours — below the launch baseline of 5.

    Review landing page, auth flow, and marketing traffic sources.

    {{#is_alert}}:red_circle: Alert triggered at {{triggered_at}}{{/is_alert}}
    {{#is_recovery}}:large_green_circle: Recovered at {{recovered_at}}{{/is_recovery}}

    ${local.slack_notify}
  EOT

  query = "sum(last_24h):sum:vb.user.registrations{env:production}.as_count() < 5"

  monitor_thresholds {
    critical = 5
    warning  = 20
  }

  notify_no_data    = false
  renotify_interval = 0

  tags = concat(local.monitor_tags, ["alert:registrations", "team:growth"])
}

# ── 5. Auth Failure Spike ─────────────────────────────────────────────────────
# Triggers when auth failure rate exceeds 10 failures/min over 5-min window.
#
# Requires app instrumentation: increment counter on every auth failure:
#   statsd.increment('vb.auth.failures', tags=['env:production','reason:<reason>'])
# Reasons: bad_password, account_locked, mfa_failure, token_expired
resource "datadog_monitor" "auth_failure_spike" {
  name    = "[VB Production] Auth Failures > 10/min"
  type    = "metric alert"
  message = <<-EOT
    Auth failure spike detected: **{{value}}/min** (threshold: 10/min).

    Possible causes: credential stuffing, broken auth flow, upstream IdP issue.

    Check Datadog APM traces for `POST /api/auth/*` and AWS WAF logs.

    {{#is_alert}}:red_circle: Alert triggered at {{triggered_at}}{{/is_alert}}
    {{#is_recovery}}:large_green_circle: Recovered at {{recovered_at}}{{/is_recovery}}

    ${local.slack_notify}
  EOT

  # .as_rate() gives per-second; multiply by 60 for per-minute
  query = "avg(last_5m):sum:vb.auth.failures{env:production}.as_rate() * 60 > 10"

  monitor_thresholds {
    critical = 10
    warning  = 5
  }

  evaluation_delay  = 60
  notify_no_data    = false
  renotify_interval = 0

  tags = concat(local.monitor_tags, ["alert:auth", "team:security"])
}

# ── 6. RDS Replication Lag ────────────────────────────────────────────────────
# Triggers when read-replica lag exceeds 30 s in either region.
# aws.rds.replica_lag is ingested automatically via the AWS integration.
resource "datadog_monitor" "rds_replication_lag" {
  name    = "[VB Production] RDS Replication Lag > 30s"
  type    = "metric alert"
  message = <<-EOT
    RDS replication lag has exceeded **30 seconds** on instance {{dbinstanceidentifier.name}}.

    Current lag: {{value}}s

    This may indicate replica divergence under heavy write load. Check RDS
    console → Replication → Replica lag for both uk and na instances.

    {{#is_alert}}:red_circle: Alert triggered at {{triggered_at}}{{/is_alert}}
    {{#is_recovery}}:large_green_circle: Recovered at {{recovered_at}}{{/is_recovery}}

    ${local.pagerduty_notify}
  EOT

  query = "avg(last_5m):max:aws.rds.replica_lag{env:production} by {dbinstanceidentifier} > 30"

  monitor_thresholds {
    critical = 30
    warning  = 10
  }

  notify_no_data    = false
  renotify_interval = 0

  tags = concat(local.monitor_tags, ["alert:rds"])
}

# ── 7. SES Bounce Rate ────────────────────────────────────────────────────────
# Triggers when email bounce rate > 5% (0.05).
# aws.ses.reputation.bounce_rate is a ratio (0.0–1.0), NOT a percentage.
# AWS SES auto-suspends sending at 10%; we alert at 5% to act first.
resource "datadog_monitor" "ses_bounce_rate" {
  name    = "[VB Production] SES Email Bounce Rate > 5%"
  type    = "metric alert"
  message = <<-EOT
    SES email bounce rate has exceeded **5%** (current: {{value}} ratio = {{eval "value * 100"}}%).

    :rotating_light: ACTION REQUIRED: High bounce rates risk SES account suspension
    and damage sending domain reputation. Suspend outbound email immediately.

    Steps:
    1. Pause SES sending in AWS console
    2. Review bounce details in SES → Suppression List
    3. Clean the email list before resuming

    {{#is_alert}}:red_circle: Alert triggered at {{triggered_at}}{{/is_alert}}
    {{#is_recovery}}:large_green_circle: Recovered at {{recovered_at}}{{/is_recovery}}

    ${local.pagerduty_notify}
  EOT

  # Threshold is the raw ratio (0.0–1.0): 5% = 0.05
  query = "avg(last_1h):avg:aws.ses.reputation.bounce_rate{*} > 0.05"

  monitor_thresholds {
    critical = 0.05
    warning  = 0.03
  }

  notify_no_data    = false
  renotify_interval = 60

  tags = concat(local.monitor_tags, ["alert:ses", "team:ops"])
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "datadog_monitor_ids" {
  description = "IDs of all launch-week Datadog monitors"
  value = {
    error_rate           = datadog_monitor.error_rate.id
    p95_latency          = datadog_monitor.p95_api_latency.id
    signup_funnel        = datadog_monitor.signup_funnel_dropoff.id
    daily_registrations  = datadog_monitor.daily_registrations.id
    auth_failures        = datadog_monitor.auth_failure_spike.id
    rds_replication_lag  = datadog_monitor.rds_replication_lag.id
    ses_bounce_rate      = datadog_monitor.ses_bounce_rate.id
  }
}
