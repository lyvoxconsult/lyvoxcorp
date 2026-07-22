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
| FR-020 | IMPLEMENTED | `apps/api/src/modules/clients/*`, `apps/web/src/modules/clients/*`, `packages/validation/*` | API-011/API-013/API-014 | DB-020 + migration 0004 | `clients.create/update/archive` | TEST-003 + integracao CRUD | PHASE-010 | GATE-010 | PF/PJ, verificadores CPF/CNPJ, endereco, contatos, tags, unicidade ativa e soft archive aprovados |
| FR-021 | PARTIAL_EXTERNAL_DEPENDENCY | `ClientsService.get`, `client_timeline_events`, `ClientDetailPage` | API-012 | DB-020 + timeline | `clients.read` com ALL/OWN | Integracao de timeline/cursor | PHASE-010 | GATE-010 | Read model e eventos de clientes aprovados; contribuicoes de reunioes/propostas/contratos/projetos/tarefas/financeiro dependem das fases proprietarias conforme DEV-0060 |
| FR-022 | IMPLEMENTED | `client_responsibles`, `ClientForm`, lookup protegido | API-011/API-013 | DB-020 + N:M | `clients.create/update`; lookup `clients.read/ALL` | Integracao de responsaveis/ownership | PHASE-010 | GATE-010 | Multiplos responsaveis ativos, validacao e leitura OWN no mesmo WHERE aprovadas |
| FR-030 | IMPLEMENTED | `apps/api/src/modules/crm/*`, `apps/web/src/modules/crm/*`, `packages/validation/src/crm.ts` | API-022 (`PATCH /leads/stage`) | DB-030 (`leads`, `lead_stages`) | `crm.update` | TEST-005 + vitest | PHASE-011 | GATE-011 | Funil Kanban com DnD acessível via teclado e movimentação de etapa aprovados |
| FR-031 | IMPLEMENTED | `CrmController.createLead`, `LeadForm` | API-021 (`POST /leads`, `POST /leads/import`) | DB-030 (`leads`) | `crm.create` | TEST-005 + vitest | PHASE-011 | GATE-011 | Cadastro individual e importação em lote via CSV aprovados |
| FR-032 | IMPLEMENTED | `CrmController.addFollowup`, `FollowupsModal` | API-021 (`POST /followups`) | DB-030 (`lead_followups`) | `crm.update` | TEST-005 + vitest | PHASE-011 | GATE-011 | Registro de follow-ups com historização e próxima ação aprovados |
| FR-033 | IMPLEMENTED | `CrmController.convertLead`, `LeadDetailsDrawer` | API-021 (`POST /leads/convert`) | DB-020/DB-030 | `crm.update` | TEST-005 + vitest | PHASE-011 | GATE-011 | Conversão de lead WON em cliente cadastrado aprovada |
| FR-040 | IMPLEMENTED | `apps/api/src/modules/meetings/*` | API-040 | DB-040 | `meetings.create` | TEST-007 | PHASE-012 | GATE-012 | Agendamento implementado; BR-040 pendente de BullMQ |
| FR-041 | IMPLEMENTED | `apps/api/src/modules/meetings/meetings.controller.ts` | API-041 | DB-040 | `meetings.update` | TEST-007 | PHASE-012 | GATE-012 | Anotações anexáveis a reuniões |
| FR-042 | PARTIAL_CROSS_PHASE_DEPENDENCY | `apps/api/src/modules/meetings/meetings.service.ts` | API-041 | DB-040 | `meetings.update` | TEST-007 | PHASE-012 | GATE-012 | Transcrição salva, mas extração depende de PHASE-022 |
| FR-043 | PARTIAL_CROSS_PHASE_DEPENDENCY | `apps/api/src/modules/meetings/meetings.service.ts` | API-080 | DB-070 | `tasks.create` | TEST-007 | PHASE-012 | GATE-012 | Ações automáticas dependem de PHASE-022 |
| FR-050 | IMPLEMENTED | `apps/api/src/modules/services/*`, `apps/web/src/modules/services/*` | API-050 (`POST /servicos`) | DB-050 (`services`) | `services.create` | TEST-003 | PHASE-013 | GATE-013 | Catálogo de serviços com unidade e tipo de cobrança |
| FR-051 | IMPLEMENTED | `ServicesRepository.updatePrice`, `ServicePriceDialog` | API-050 (`PUT /servicos/:id/precos`) | DB-050 (`service_price_versions`)| `services.update` | TEST-003 | PHASE-013 | GATE-013 | Versionamento de preços por data de vigência |
| FR-052 | IMPLEMENTED | `ServicesController.list`, `ServicesPage` | API-050 (`GET /servicos`) | DB-050 (`services`) | `services.read` | TEST-003 | PHASE-013 | GATE-013 | Suporte a cobrança pontual e recorrente |
| FR-060 | IMPLEMENTED | `apps/api/src/modules/proposals/*`, `apps/web/src/modules/proposals/*` | API-030 (`POST /propostas`) | DB-060 (`proposals`) | `proposals.create` | TEST-006 | PHASE-014 | GATE-014 | Emissão de propostas comerciais com desconto e validade |
| FR-061 | IMPLEMENTED | `proposals.repository.ts`, `ProposalFormDialog` | API-030 (`POST /propostas`) | DB-060 (`proposal_items`) | `proposals.create` | TEST-006 | PHASE-014 | GATE-014 | Itens da proposta com quantidade, preço unitário e desconto |
| FR-062 | IMPLEMENTED | `ProposalsController.approve`, `ProposalsPage` | API-030 (`POST /propostas/:id/aprovar`) | DB-060 (`proposals`) | `proposals.approve` | TEST-062 | PHASE-014 | GATE-014 | Aprovação interna de propostas comerciais no escopo |
| FR-063 | PARTIAL_CROSS_PHASE_DEPENDENCY | `ProposalsController.convertToContract`, `ConvertContractDialog` | API-031 (`POST /propostas/:id/converter-contrato`) | DB-060 (`contracts`) | `contracts.create` | TEST-006 | PHASE-014 | GATE-014 | Conversão em contrato ativo; parcelas financeiras pendentes da PHASE-016 |
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
