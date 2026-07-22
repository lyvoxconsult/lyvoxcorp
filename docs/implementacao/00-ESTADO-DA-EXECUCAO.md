---
title: Estado da Execucao
date: 2026-07-22
phase: PHASE-014
gate: GATE-014
status: in-progress
---

# Estado da execucao

| Campo | Estado |
|---|---|
| Fase atual | `PHASE-014` |
| Ultima fase concluida | `PHASE-013` (`APPROVED`) |
| Gate atual | `GATE-014 = IN_PROGRESS` (Gate anterior `GATE-013` `APPROVED`) |
| Branch | `feature/greenfield-foundation` |
| Commit-base | `01a28935f9328225d9bbfd08a7073b873fdab198` |
| Servicos em execucao | Suporte local: PostgreSQL, PgBouncer, Redis e Mailpit healthy; nenhum servico do produto |

| Migrations aplicadas | `0001_initial_schema.sql` a `0007_services_domain.sql`; reaplicacao idempotente com `applied=0`, tabelas do domínio e `drizzle-kit check` aprovado |
| Testes aprovados | 131/131 na raiz (11 auth, 47 API, 4 permissions, 13 validation, 56 web); build, smoke HTTP/browser, frozen lock, typecheck e lint aprovados |
| Testes falhando | Nenhum |
| FRs concluidos | `17/54` em escopo (`FR-001`, `FR-002`, `FR-004`, `FR-005`, `FR-007`, `FR-020`, `FR-022`, `FR-023`, `FR-030`, `FR-031`, `FR-032`, `FR-033`, `FR-040`, `FR-041`, `FR-050`, `FR-051`, `FR-052`) |
| FRs pendentes | `37/54` em escopo; `FR-003`, `FR-006`, `FR-021`, `FR-042` e `FR-043` permanecem parciais por dependencias externas/fases proprietarias |
| FRs fora do escopo inicial | `FR-062`, `FR-073` por precedencia do prompt mestre e documentacao canonica |
| Bloqueios | Nenhum `HARD_BLOCKER` local |
| Proxima acao exata | Executar a PHASE-014 (Propostas e Contratos) conforme roadmap canonico |

## Restricoes ativas

- `LEGACY_ACCESS_ALLOWED = NO`
- `LOCAL_DEVELOPMENT_FIRST = YES`
- `STAGING_BEFORE_PRODUCTION = YES`
- `AUTONOMOUS_CONTINUATION = YES`
- Vault `D:\Obsidian\obsidian` indisponivel no ambiente atual; registro local mantido em `docs/implementacao/`.
