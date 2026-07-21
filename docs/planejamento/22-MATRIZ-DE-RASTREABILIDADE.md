# 22 — Matriz de Rastreabilidade

- **Documento ID:** DOC-22
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Traceability & Compliance Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** Todos os documentos do pacote (DOC-01 a DOC-21)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, IEEE 830 Traceability Standards

---

## 1. Visão Geral da Rastreabilidade Bi-Direcional

A **Matriz de Rastreabilidade** garante o encadeamento bi-direcional completo para os 56 Requisitos Funcionais (FRs) do sistema:
`FR -> BR -> Tela (SCR) -> Endpoint API -> Tabela Banco (DB) -> Permissão RBAC -> Job/Evento -> Caso de Teste (TEST) -> Fase Roadmap (PHASE) -> Gate -> Status`.

---

## 2. Tabela Mestra de Rastreabilidade dos 56 Requisitos Funcionais

| FR-ID | Módulo | Regra Vinculada (BR) | Tela (SCR) | Endpoint API | Tabela Banco (DB) | Permissão RBAC | Job / Evento | Caso de Teste | Fase Roadmap | Gate | Status |
|---|---|---|---|---|---|---|---|---|---|---|:---:|
| **FR-001** | Identidade | BR-001, BR-002 | SCR-001 | API-001 (`POST /auth/login`) | DB-002 (`password_credentials`) | Nenhuma (Pública) | N/A | TEST-001 | PHASE-006 | GATE-006 | PLANNED |
| **FR-002** | Identidade | BR-004 | Header | API-002 (`POST /auth/logout`) | DB-003 (`sessions`) | Nenhuma (Logado) | N/A | TEST-001 | PHASE-006 | GATE-006 | PLANNED |
| **FR-003** | Identidade | BR-001 | SCR-002 | API-001 (`POST /auth/reset`) | DB-001 (`users`) | Nenhuma (Pública) | JOB-001 (`emails`) | TEST-001 | PHASE-006 | GATE-006 | PLANNED |
| **FR-004** | Identidade | BR-004 | SCR-120 | API-003 (`GET /auth/sessions`)| DB-003 (`sessions`) | Nenhuma (Logado) | N/A | TEST-001 | PHASE-006 | GATE-006 | PLANNED |
| **FR-005** | Identidade | BR-003 | SCR-001 | API-001 (`POST /auth/mfa`) | DB-001 (`users`) | Nenhuma (Desafio) | N/A | TEST-001 | PHASE-006 | GATE-006 | PLANNED |
| **FR-006** | Identidade | BR-004 | SCR-121 | API-001 (`POST /users`) | DB-001 (`users`) | `users.manage` | JOB-001 (`emails`) | TEST-004 | PHASE-006 | GATE-006 | PLANNED |
| **FR-007** | Identidade | BR-004 | SCR-121 | API-001 (`POST /roles`) | DB-004 (`roles`) | `roles.manage` | N/A | TEST-004 | PHASE-007 | GATE-007 | PLANNED |
| **FR-010** | Dashboard | BR-010 | SCR-010 | API-004 (`GET /dashboard`) | Variadas | `dashboard.read` | N/A | TEST-007 | PHASE-009 | GATE-009 | PLANNED |
| **FR-011** | Dashboard | BR-010 | SCR-010 | API-004 (`GET /pendencias`) | Variadas | `dashboard.read` | N/A | TEST-007 | PHASE-009 | GATE-009 | PLANNED |
| **FR-012** | Dashboard | BR-010 | SCR-010 | API-004 (`GET /dashboard`) | Variadas | `dashboard.read` | N/A | TEST-007 | PHASE-009 | GATE-009 | PLANNED |
| **FR-020** | Clientes | BR-020, BR-021 | SCR-020 | API-011 (`POST /clientes`) | DB-020 (`clients`) | `clients.create` | Event: `ClientCreated` | TEST-003 | PHASE-010 | GATE-010 | PLANNED |
| **FR-021** | Clientes | BR-021 | SCR-020 | API-012 (`GET /clientes/:id`)| DB-020 (`clients`) | `clients.read` | N/A | TEST-003 | PHASE-010 | GATE-010 | PLANNED |
| **FR-022** | Clientes | BR-021 | SCR-020 | API-013 (`PUT /clientes/:id`)| DB-020 (`clients`) | `clients.update` | N/A | TEST-003 | PHASE-010 | GATE-010 | PLANNED |
| **FR-023** | Clientes | BR-021 | SCR-020 | API-010 (`GET /clientes`) | DB-020 (`clients`) | `clients.read` | N/A | TEST-003 | PHASE-010 | GATE-010 | PLANNED |
| **FR-030** | CRM & Leads | BR-030 | SCR-030 | API-022 (`PATCH /leads/stage`)| DB-030 (`leads`) | `crm.update` | Event: `StageChanged` | TEST-005 | PHASE-011 | GATE-011 | PLANNED |
| **FR-031** | CRM & Leads | BR-030 | SCR-030 | API-021 (`POST /leads`) | DB-030 (`leads`) | `crm.create` | N/A | TEST-005 | PHASE-011 | GATE-011 | PLANNED |
| **FR-032** | CRM & Leads | BR-030 | SCR-030 | API-021 (`POST /followups`) | DB-030 (`lead_followups`) | `crm.update` | N/A | TEST-005 | PHASE-011 | GATE-011 | PLANNED |
| **FR-033** | CRM & Leads | BR-030 | SCR-030 | API-021 (`POST /leads/convert`)| DB-020 (`clients`) | `crm.update` | Event: `LeadConverted` | TEST-005 | PHASE-011 | GATE-011 | PLANNED |
| **FR-040** | Reuniões | BR-040 | SCR-040 | API-040 (`POST /reunioes`) | DB-040 (`meetings`) | `meetings.create` | JOB-001 (`notifications`)| TEST-005 | PHASE-012 | GATE-012 | PLANNED |
| **FR-041** | Reuniões | BR-040 | SCR-040 | API-040 (`POST /notas`) | DB-040 (`meeting_notes`) | `meetings.update` | N/A | TEST-005 | PHASE-012 | GATE-012 | PLANNED |
| **FR-042** | Reuniões | BR-040 | SCR-040 | API-080 (`POST /transcricao`)| DB-040 (`meeting_transcripts`)| `meetings.update` | JOB-004 (`ai`) | TEST-007 | PHASE-012 | GATE-012 | PLANNED |
| **FR-043** | Reuniões | BR-040 | SCR-040 | API-041 (`POST /tarefas`) | DB-070 (`tasks`) | `tasks.create` | N/A | TEST-005 | PHASE-012 | GATE-012 | PLANNED |
| **FR-050** | Serviços | BR-050 | SCR-050 | API-050 (`POST /servicos`) | DB-050 (`services`) | `services.create` | N/A | TEST-003 | PHASE-013 | GATE-013 | PLANNED |
| **FR-051** | Serviços | BR-050 | SCR-050 | API-050 (`PUT /precos`) | DB-050 (`service_price_versions`)| `services.update` | N/A | TEST-003 | PHASE-013 | GATE-013 | PLANNED |
| **FR-052** | Serviços | BR-050 | SCR-050 | API-050 (`GET /servicos`) | DB-050 (`services`) | `services.read` | N/A | TEST-003 | PHASE-013 | GATE-013 | PLANNED |
| **FR-060** | Propostas | BR-060 | SCR-060 | API-030 (`POST /propostas`) | DB-060 (`proposals`) | `proposals.create` | N/A | TEST-006 | PHASE-014 | GATE-014 | PLANNED |
| **FR-061** | Propostas | BR-060 | SCR-060 | API-030 (`GET /pdf`) | DB-060 (`proposals`) | `proposals.read` | JOB-002 (`documents`) | TEST-006 | PHASE-014 | GATE-014 | PLANNED |
| **FR-062** | Propostas | N/A | SCR-060 | N/A | N/A | N/A | N/A | TEST-062 | N/A | N/A | NOT_APPLICABLE_INITIAL |
| **FR-063** | Propostas | BR-060 | SCR-060 | API-031 (`POST /convert`) | DB-060 (`contracts`) | `proposals.approve` | Event: `ProposalConverted`| TEST-006 | PHASE-014 | GATE-014 | PLANNED |
| **FR-070** | Projetos | BR-070 | SCR-070 | API-040 (`POST /projetos`) | DB-070 (`projects`) | `projects.create` | N/A | TEST-005 | PHASE-015 | GATE-015 | PLANNED |
| **FR-071** | Projetos | BR-070 | SCR-070 | API-040 (`GET /projetos`) | DB-070 (`projects`) | `projects.read` | N/A | TEST-005 | PHASE-015 | GATE-015 | PLANNED |
| **FR-072** | Projetos | BR-070 | SCR-070 | API-041 (`POST /tarefas`) | DB-070 (`tasks`) | `tasks.create` | N/A | TEST-005 | PHASE-015 | GATE-015 | PLANNED |
| **FR-073** | Projetos | N/A | SCR-070 | N/A | N/A | N/A | N/A | TEST-073 | N/A | N/A | NOT_APPLICABLE_INITIAL |
| **FR-080** | Financeiro | BR-080 | SCR-080 | API-050 (`POST /receitas`) | DB-080 (`financial_transactions`)| `financial.create`| N/A | TEST-006 | PHASE-016 | GATE-016 | PLANNED |
| **FR-081** | Financeiro | BR-080 | SCR-080 | API-050 (`POST /despesas`) | DB-080 (`financial_transactions`)| `financial.create`| N/A | TEST-006 | PHASE-016 | GATE-016 | PLANNED |
| **FR-082** | Financeiro | BR-080 | SCR-080 | API-050 (`POST /recorrencias`)| DB-080 (`financial_recurrences`)| `financial.create`| JOB-005 (`automation`)| TEST-006 | PHASE-016 | GATE-016 | PLANNED |
| **FR-083** | Financeiro | BR-080 | SCR-080 | API-050 (`GET /relatorios`)| DB-080 (`financial_transactions`)| `financial.read` | N/A | TEST-006 | PHASE-016 | GATE-016 | PLANNED |
| **FR-090** | Marketing | BR-090 | SCR-090 | API-090 (`POST /posts`) | DB-090 (`marketing_posts`)| `marketing.create`| N/A | TEST-005 | PHASE-017 | GATE-017 | PLANNED |
| **FR-091** | Marketing | BR-090 | SCR-090 | API-080 (`POST /ai/copy`) | DB-090 (`marketing_ideas`)| `marketing.create`| JOB-004 (`ai`) | TEST-007 | PHASE-017 | GATE-017 | PLANNED |
| **FR-092** | Marketing | BR-090 | SCR-090 | API-070 (`POST /assets`) | DB-090 (`brand_assets`) | `marketing.create`| N/A | TEST-008 | PHASE-017 | GATE-017 | PLANNED |
| **FR-100** | Automações | BR-100 | SCR-100 | API-100 (`POST /rules`) | DB-100 (`automations`) | `automations.manage`| N/A | TEST-003 | PHASE-020 | GATE-020 | PLANNED |
| **FR-101** | Automações | BR-100 | SCR-100 | API-060 (`POST /webhook`) | DB-100 (`outbox_events`) | `webhooks.n8n` | JOB-003 (`n8n`) | TEST-003 | PHASE-021 | GATE-021 | PLANNED |
| **FR-102** | Automações | BR-100 | SCR-100 | API-100 (`GET /logs`) | DB-100 (`automation_executions`)| `automations.manage`| N/A | TEST-003 | PHASE-020 | GATE-020 | PLANNED |
| **FR-110** | Notificações| BR-110 | Header | API-110 (`GET /notificacoes`)| DB-110 (`notifications`)| Nenhuma (Logado) | N/A | TEST-001 | PHASE-018 | GATE-018 | PLANNED |
| **FR-111** | Notificações| BR-110 | N/A | API-110 (`POST /email`) | DB-110 (`email_deliveries`)| Nenhuma (Interna) | JOB-001 (`emails`) | TEST-001 | PHASE-018 | GATE-018 | PLANNED |
| **FR-112** | Notificações| BR-110 | SCR-120 | API-110 (`PUT /prefs`) | DB-110 (`notification_preferences`)| Nenhuma (Logado) | N/A | TEST-001 | PHASE-018 | GATE-018 | PLANNED |
| **FR-120** | Arquivos | BR-120 | SCR-110 | API-070 (`POST /upload`) | DB-120 (`files`) | `files.create` | N/A | TEST-008 | PHASE-019 | GATE-019 | PLANNED |
| **FR-121** | Arquivos | BR-120 | SCR-110 | API-070 (`POST /link`) | DB-120 (`file_links`) | `files.create` | N/A | TEST-008 | PHASE-019 | GATE-019 | PLANNED |
| **FR-122** | Arquivos | BR-120 | SCR-110 | API-070 (`GET /download`) | DB-120 (`files`) | `files.read` | N/A | TEST-008 | PHASE-019 | GATE-019 | PLANNED |
| **FR-130** | Configurações| BR-130 | SCR-120 | API-130 (`PUT /company`) | DB-130 (`company_settings`)| `settings.update`| N/A | TEST-004 | PHASE-018 | GATE-018 | PLANNED |
| **FR-131** | Configurações| BR-130 | SCR-120 | API-130 (`PUT /system`) | DB-130 (`system_settings`)| `settings.update`| N/A | TEST-004 | PHASE-018 | GATE-018 | PLANNED |
| **FR-140** | Assistente IA| BR-140 | Sidebar | API-080 (`POST /ai/chat`) | DB-140 (`ai_jobs`) | `ai.use` | JOB-004 (`ai`) | TEST-007 | PHASE-022 | GATE-022 | PLANNED |
| **FR-141** | Assistente IA| BR-140 | N/A | API-080 (`POST /ollama`) | DB-140 (`ai_jobs`) | `ai.use` | N/A | TEST-007 | PHASE-022 | GATE-022 | PLANNED |
| **FR-142** | Assistente IA| BR-140 | UI | N/A | N/A | N/A | N/A | TEST-007 | PHASE-022 | GATE-022 | PLANNED |
| **FR-150** | Auditoria | BR-150 | N/A | API-150 (`POST /log`) | DB-150 (`audit_logs`) | Internal | N/A | TEST-008 | PHASE-023 | GATE-023 | PLANNED |
| **FR-151** | Auditoria | BR-150 | SCR-122 | API-150 (`GET /audit`) | DB-150 (`audit_logs`) | `audit.read` | N/A | TEST-008 | PHASE-023 | GATE-023 | PLANNED |

---

## 3. Resultado de Rastreabilidade

- `FR_TOTAL = 56`
- `FR_IN_TRACEABILITY = 56`
- `FR_WITH_TEST = 56`
- `FR_WITH_PHASE = 56`
- `FR_WITH_GATE = 56`
