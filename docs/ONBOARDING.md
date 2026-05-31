# Engineering Onboarding

Welcome to V.B. This document gets you from zero to productive in under 1 hour.

## Day 1 Checklist

- [ ] Slack workspace joined → ask ops for invite
- [ ] GitHub org access → request from Engineering Lead
- [ ] Notion wiki access → request from Operations Lead
- [ ] Local dev environment running → follow `LOCAL_DEV.md`
- [ ] First PR opened (even a README tweak) to verify CI runs

## Key Channels (Slack)

| Channel | Purpose |
|---------|---------|
| `#engineering` | Technical discussion |
| `#deployments` | Automated deploy notifications |
| `#general` | Company-wide announcements |

## Key Repositories

| Repo | Purpose |
|------|---------|
| `vb-org/vb-monorepo` | Main product monorepo |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript |
| Backend | Node.js 20, Express, TypeScript |
| Infrastructure | AWS (ECS/RDS), Terraform |
| CI/CD | GitHub Actions |
| Shared types | `@vb/shared` package |

## Environments

| Environment | Trigger | URL |
|-------------|---------|-----|
| Local | `yarn dev` | localhost:3000 / :3001 |
| Staging | PR merge to `main` | staging.vb.app |
| Production | GitHub Release published | app.vb.app |

## Development Workflow

1. Branch off `main`: `git checkout -b feat/your-feature`
2. Make changes, run `yarn lint && yarn typecheck && yarn test` locally
3. Open PR → CI runs automatically (lint, typecheck, test, build)
4. Get one review approval
5. Merge → staging deploy triggers automatically
6. For production: create a GitHub Release
