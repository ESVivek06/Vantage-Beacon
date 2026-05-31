# Local Development Setup

Get a full local environment running in under 5 minutes.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | https://nodejs.org or `nvm install 20` |
| Yarn | ≥ 1.22 | `npm i -g yarn` |
| Git | any | https://git-scm.com |
| Docker | any | https://docker.com (optional, for local DB) |

## Quick Start (one command)

```bash
git clone https://github.com/vb-org/vb-monorepo.git && cd vb-monorepo && cp .env.example .env && yarn install && yarn dev
```

That's it. Both apps start:
- **Web** → http://localhost:3000
- **API** → http://localhost:3001

## Step-by-step

```bash
# 1. Clone
git clone https://github.com/vb-org/vb-monorepo.git
cd vb-monorepo

# 2. Environment variables
cp .env.example .env
# Edit .env if you need a real database URL

# 3. Install all dependencies (monorepo-wide)
yarn install

# 4. Start both apps concurrently
yarn dev
```

## Project Structure

```
vb-monorepo/
├── apps/
│   ├── api/          # Node.js + Express + TypeScript backend (port 3001)
│   └── web/          # Next.js 14 frontend (port 3000)
├── packages/
│   └── shared/       # Shared types used by both apps
├── infra/
│   └── terraform/    # AWS infrastructure (staging + prod)
└── .github/
    └── workflows/    # CI/CD pipelines
```

## Common Commands

```bash
yarn dev          # Start both apps in watch mode
yarn build        # Build all apps
yarn lint         # Lint all apps
yarn test         # Run all tests
yarn typecheck    # TypeScript check across monorepo
```

## Workspace-scoped commands

```bash
yarn workspace @vb/api dev        # API only
yarn workspace @vb/web dev        # Web only
yarn workspace @vb/shared build   # Build shared package
```

## Database (local)

```bash
docker run -d --name vb-db \
  -e POSTGRES_DB=vb_dev \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16

# Update .env: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vb_dev
```

## Troubleshooting

**Port already in use** — kill the process: `lsof -ti:3000 | xargs kill`

**`yarn install` fails** — ensure Node 20+: `node --version`

**TypeScript errors after pulling** — run `yarn build` in shared first: `yarn workspace @vb/shared build`

## Branch & PR Conventions

- `main` — production-ready; protected, requires PR + CI pass
- `develop` — staging; PRs merge here first
- Feature branches: `feat/<description>`
- Bug fixes: `fix/<description>`

Every PR to `main` triggers the staging deploy pipeline automatically.

## Access & Accounts

Contact the Engineering Lead or Operations Lead for:
- GitHub org access (`vb-org`)
- AWS IAM credentials for staging
- Vercel team membership
- Slack workspace invite (`#engineering`, `#deployments`)
- Notion wiki access
