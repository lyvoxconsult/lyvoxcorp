# WORKSTREAM A — STATUS & BASELINE

> **Branch:** `parallel/a-stabilization-platform`  
> **Created:** 2026-07-23  
> **HEAD commit:** (see `git rev-parse HEAD`)  
> **Status:** IN PROGRESS — Phases 011–015 revalidation, 023–026 stabilization  

---

## Scope

- Stabilize, revalidate, and certify the LYVOX GERENCIAMENTO platform
- Phases 011–015: revalidate existing business modules (CRM, Reuniões, Serviços, Propostas, Projetos/Tarefas)
- Phases 023–026: stabilization (build, lint, typecheck, tests, infra, security)
- After integration with WORKSTREAM B: certify full stack (Phases 016–026)
- Finally: PHASE-027–030 (deploy, observability, docs, handoff)

## Key Baseline Facts

| Item | Value |
|---|---|
| Monorepo | `apps/api`, `apps/web`, `apps/worker`, `packages/*` |
| Node | `v20.20.2` (via fnm) |
| pnpm | `10.34.5` (via corepack) |
| Database | PostgreSQL + PgBouncer (scram-sha-256) |
| Secrets to rotate | `POSTGRES_PASSWORD`, `API_SESSION_SECRET`, `AUTH_MFA_ENCRYPTION_KEY` |
| Do NOT create | Migrations `0010+` (belongs to WORKSTREAM B) |
| Integration branch | `integration/lyvox-completion` (to be created later) |

## Gates Status

| Gate | Status | Notes |
|---|---|---|
| A0.0 Git audit | ✅ Complete | `BASE_SHA = 6e65eb3` |
| A0.5 Catalog | ✅ Complete | Monorepo structure confirmed |
| A0.6 Node/pnpm | ✅ Complete | fnm + corepack resolved |
| A0.7 Coordination docs | 🔄 In Progress | This doc + REQUESTS-FOR-WORKSTREAM-B |
| A0.8 Secrets + infra | ⏳ Pending | Rotate secrets, pnpm infra:up |
| A0.9 Revalidate 011–015 | ⏳ Pending | Build, lint, typecheck, test all phases |
| PHASE-023 | ⏳ Pending | Stabilization |
| PHASE-024 | ⏳ Pending | Stabilization |
| PHASE-025 | ⏳ Pending | Stabilization |
| PHASE-026 | ⏳ Pending | Stabilization |

## Marker Commit (publish when baseline ready)

```
docs(coordination): workstream A baseline ready
```
