---
title: Estado da Execucao
date: 2026-07-22
phase: PHASE-012
gate: GATE-012
status: in-progress
---

# Estado da execucao

| Campo | Estado |
|---|---|
| Fase atual | `PHASE-012` |
| Ultima fase concluida | `PHASE-011` (`APPROVED`) |
| Gate atual | `GATE-012 = IN_PROGRESS` (Gate anterior `GATE-011` `APPROVED`) |
| Branch | `feature/greenfield-foundation` |
| Commit-base | `01a28935f9328225d9bbfd08a7073b873fdab198` |
| Servicos em execucao | Suporte local: PostgreSQL, PgBouncer, Redis e Mailpit healthy; nenhum servico do produto |

| Migrations aplicadas | `0001_initial_schema.sql` a `0005_crm_domain.sql`; reaplicacao idempotente com `applied=0`, 35 tabelas e `drizzle-kit check` aprovado |
| Testes aprovados | 93/93 na raiz (10 auth, 45 API, 4 permissions, 5 validation, 43 web); cobertura API 96,66% linhas e web 81,56% linhas; build, smoke HTTP/browser, frozen lock, typecheck e lint aprovados |
| Testes falhando | Nenhum |
| FRs concluidos | `12/54` em escopo (`FR-001`, `FR-002`, `FR-004`, `FR-005`, `FR-007`, `FR-020`, `FR-022`, `FR-023`, `FR-030`, `FR-031`, `FR-032`, `FR-033`) |
| FRs pendentes | `42/54` em escopo; `FR-003`, `FR-006` e `FR-021` permanecem parciais por dependencias externas/fases proprietarias |
| FRs fora do escopo inicial | `FR-062`, `FR-073` por precedencia do prompt mestre e documentacao canonica |
| Bloqueios | Nenhum `HARD_BLOCKER` local |
| Proxima acao exata | Executar a PHASE-012 (Reuniões) conforme roadmap canonico |

## Restricoes ativas

- `LEGACY_ACCESS_ALLOWED = NO`
- `LOCAL_DEVELOPMENT_FIRST = YES`
- `STAGING_BEFORE_PRODUCTION = YES`
- `AUTONOMOUS_CONTINUATION = YES`
- Vault `D:\Obsidian\obsidian` indisponivel no ambiente atual; registro local mantido em `docs/implementacao/`.
