---
title: Rastreabilidade Implementada
date: 2026-07-22
phase: PHASE-010
---

# Rastreabilidade implementada

Nenhum FR foi implementado na PHASE-000. A matriz inicia o estado sem simular entrega e preserva os mapeamentos do DOC-22; divergencias mecanicas estao no log DEV-0013..DEV-0016.

| FR | Status | Codigo | API | DB | Permissao | Testes | Fase | Gate | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| FR-001 | IMPLEMENTED | `apps/api/src/modules/auth/*`, `packages/auth/*` | API-001 + subrotas MFA | DB-001..DB-003 + migration 0002 | Publica/desafio | TEST-001 | PHASE-006 | GATE-006 | Login, lockout, rotacao, MFA e integracao real aprovados |
| FR-002 | IMPLEMENTED | `AuthController.logout`, `AuthService.logoutByToken` | API-002 | DB-003 | Logado + CSRF | TEST-001 | PHASE-006 | GATE-006 | Revogacao autoritativa e cookie expirado testados |
| FR-003 | PARTIAL_EXTERNAL_DEPENDENCY | `forgotPassword`, `resetPassword` | `/auth/password/*` | DB-001 + reset/outbox | Publica | TEST-001/JOB-001 | PHASE-006 | GATE-006 | Token unico 15 min, outbox criptografada e revogacao testados; e-mail real pendente conforme DEV-0033 |
| FR-004 | IMPLEMENTED | `listSessions`, `revokeSession`, `logoutAll` | `/auth/sessions*` | DB-003 | Logado + CSRF em mutacoes | TEST-001 | PHASE-006 | GATE-006 | Isolamento cross-user, revogacao individual/global e sessao atual testados |
| FR-005 | IMPLEMENTED | `setupMfa`, `activateMfa`, `completeMfa` | `/auth/mfa/*` | DB-001 + tabelas MFA | Desafio | TEST-001 | PHASE-006 | GATE-006 | TOTP 160-bit, anti-replay, oito backup codes e consumo unico testados |
| FR-006 | PARTIAL_EXTERNAL_DEPENDENCY | `AuthorizationController.users` | `GET /users` | DB-001/DB-004 | `users.manage` | TEST-004 | PHASE-007 | GATE-007 | Listagem e fronteira admin funcionais; convite/lifecycle pendentes de JOB-001 conforme DEV-0045 |
| FR-007 | IMPLEMENTED | `RbacGuard`, `AuthorizationService.createRole`, `packages/permissions` | `GET/POST /roles` | DB-004/DB-005 + migration 0003 | `roles.manage` | TEST-004 | PHASE-007 | GATE-007 | Cargo customizado com grants/scopes vivos, matriz 5/18/47, revogacao imediata e ownership aprovados no gate |
| FR-010..FR-012 | NOT_STARTED | Fundacao transversal em `apps/web/src/*`, sem dashboard funcional | API-004 | Variadas | `dashboard.read` | TEST-007 | PHASE-009 | GATE-009 | Shell/UI base aprovados; nenhuma KPI, atividade, reuniao ou tarefa de negocio entregue; DOC-22:32-34; DEV-0016 |
| FR-020..FR-023 | NOT_STARTED | - | API-010..API-013 | DB-020 | `clients.*` | TEST-003 | PHASE-010 | GATE-010 | DOC-22:35-38 |
| FR-030..FR-033 | NOT_STARTED | - | API-021..API-022 | DB-020/DB-030 | `crm.*` | TEST-005 | PHASE-011 | GATE-011 | DOC-22:39-42 |
| FR-040..FR-043 | NOT_STARTED | - | API-040/API-041/API-080 | DB-040/DB-070 | `meetings.*`/`tasks.create` | TEST-005/TEST-007 | PHASE-012 | GATE-012 | DOC-22:43-46 |
| FR-050..FR-052 | NOT_STARTED | - | API-050 | DB-050 | `services.*` | TEST-003 | PHASE-013 | GATE-013 | DOC-22:47-49 |
| FR-060..FR-061 | NOT_STARTED | - | API-030 | DB-060 | `proposals.*` | TEST-006 | PHASE-014 | GATE-014 | DOC-22:50-51 |
| FR-062 | OUT_OF_SCOPE_INITIAL | - | - | - | - | TEST-062 | - | - | Prompt mestre secao 46; DOC-22:52 |
| FR-063 | NOT_STARTED | - | API-031 | DB-060 | `proposals.approve` | TEST-006 | PHASE-014 | GATE-014 | DOC-22:53 |
| FR-070..FR-072 | NOT_STARTED | - | API-040/API-041 | DB-070 | `projects.*`/`tasks.create` | TEST-005 | PHASE-015 | GATE-015 | DOC-22:54-56 |
| FR-073 | OUT_OF_SCOPE_INITIAL | - | - | - | - | TEST-073 | - | - | Prompt mestre secao 46; DOC-22:57 |
| FR-080..FR-083 | NOT_STARTED | - | API-050 | DB-080 | `financial.*` | TEST-006 | PHASE-016 | GATE-016 | DOC-22:58-61 |
| FR-090..FR-092 | NOT_STARTED | - | API-070/API-080/API-090 | DB-090 | `marketing.create` | TEST-005/TEST-007/TEST-008 | PHASE-017 | GATE-017 | DOC-22:62-64 |
| FR-100/FR-102 | NOT_STARTED | - | API-100 | DB-100 | `automations.manage` | TEST-003 | PHASE-020 | GATE-020 | DOC-22:65,67 |
| FR-101 | NOT_STARTED | - | API-060 | DB-100 | `webhooks.n8n` | TEST-003 | PHASE-021 | GATE-021 | DOC-22:66 |
| FR-110..FR-112 | NOT_STARTED | - | API-110 | DB-110 | Logado/Interna | TEST-001 | PHASE-018 | GATE-018 | DOC-22:68-70 |
| FR-120..FR-122 | NOT_STARTED | - | API-070 | DB-120 | `files.*` | TEST-008 | PHASE-019 | GATE-019 | DOC-22:71-73 |
| FR-130..FR-131 | NOT_STARTED | - | API-130 | DB-130 | `settings.update` | TEST-004 | PHASE-018 | GATE-018 | DOC-22:74-75; DEV-0016 |
| FR-140..FR-142 | NOT_STARTED | - | API-080/N/A | DB-140/N/A | `ai.use`/N/A | TEST-007 | PHASE-022 | GATE-022 | DOC-22:76-78 |
| FR-150..FR-151 | NOT_STARTED | - | API-150 | DB-150 | Internal/`audit.read` | TEST-008 | PHASE-023 | GATE-023 | DOC-22:79-80 |

## Fundacao transversal de banco - PHASE-005

Os FRs permanecem `NOT_STARTED`: a fase entregou apenas a persistencia mestre transversal. A migration `0001_initial_schema.sql` materializa as tabelas de DOC-08 e as estruturas obrigatorias de RBAC, inbox e idempotencia; comportamento funcional, seeds e APIs continuam sob os gates proprietarios.
