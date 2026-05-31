# V.B Monorepo

Node.js/TypeScript backend + Next.js frontend, managed as a Yarn monorepo.

## Quick Start

```bash
git clone https://github.com/vb-org/vb-monorepo.git
cd vb-monorepo
cp .env.example .env
yarn install
yarn dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/health

## Structure

```
apps/api      — Express + TypeScript backend
apps/web      — Next.js 14 frontend
packages/shared — Shared types
infra/        — Terraform (AWS staging + prod)
.github/      — CI/CD workflows
docs/         — Onboarding and dev guides
```

## Documentation

- [Local Dev Setup](docs/LOCAL_DEV.md)
- [Engineer Onboarding](docs/ONBOARDING.md)
