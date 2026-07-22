---
title: Estado da Execucao
date: 2026-07-22
phase: PHASE-016
gate: GATE-016
status: in-progress
---

# Estado da execucao

| Campo | Estado |
|---|---|
| Fase atual | `PHASE-016` |
| Ultima fase concluida | `PHASE-015` (`APPROVED`) |
| Gate atual | `GATE-016 = IN_PROGRESS` (Gate anterior `GATE-015` `APPROVED`) |
| Branch | `feature/greenfield-foundation` |
| Commit-base | `01a28935f9328225d9bbfd08a7073b873fdab198` |
| Servicos em execucao | Suporte local: PostgreSQL, PgBouncer, Redis e Mailpit healthy; nenhum servico do produto |

| Migrations aplicadas | `0001_initial_schema.sql` a `0007_services_domain.sql`; reaplicacao idempotente com `applied=0`, tabelas do domínio e `drizzle-kit check` aprovado |
| Testes aprovados | 143/143 na raiz (11 auth, 52 API, 4 permissions, 19 validation, 57 web); build, smoke HTTP/browser, frozen lock, typecheck e lint aprovados |
| Testes falhando | Nenhum |
| FRs concluidos | `24/54` em escopo (`FR-001`, `FR-002`, `FR-004`, `FR-005`, `FR-007`, `FR-020`, `FR-022`, `FR-023`, `FR-030`, `FR-031`, `FR-032`, `FR-033`, `FR-040`, `FR-041`, `FR-043`, `FR-050`, `FR-051`, `FR-052`, `FR-060`, `FR-061`, `FR-062`, `FR-070`, `FR-071`, `FR-072`) |
| FRs pendentes | `30/54` em escopo; `FR-003`, `FR-006`, `FR-021`, `FR-042` e `FR-063` permanecem parciais por dependencias externas/fases proprietarias |
| FRs fora do escopo inicial | `FR-073` por precedencia do prompt mestre e documentacao canonica |
| Bloqueios | Nenhum `HARD_BLOCKER` local |
| Proxima acao exata | Executar a PHASE-016 (Financeiro) conforme roadmap canonico |

## Restricoes ativas

- `LEGACY_ACCESS_ALLOWED = NO`
- `LOCAL_DEVELOPMENT_FIRST = YES`
- `STAGING_BEFORE_PRODUCTION = YES`
- `AUTONOMOUS_CONTINUATION = YES`
- Vault `D:\Obsidian\obsidian` indisponivel no ambiente atual; registro local mantido em `docs/implementacao/`.
