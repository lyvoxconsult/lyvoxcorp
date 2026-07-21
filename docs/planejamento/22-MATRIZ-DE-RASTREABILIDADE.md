# 22 — Matriz de Rastreabilidade

- **Documento ID:** DOC-22
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Traceability & Compliance Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** Todos os documentos do pacote (DOC-01 a DOC-21)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, IEEE 830 Traceability Standards

---

## 1. Visão Geral da Rastreabilidade

A **Matriz de Rastreabilidade** garante o encadeamento bi-direcional completo de ponta a ponta:
`Requisito Confirmado (REQ-CONF) / Funcional (FR) -> Tela (SCR) -> Endpoint API (API) -> Tabela Banco (DB) -> Permissão RBAC -> Job/Evento -> Caso de Teste (TEST) -> Fase de Implementação (PHASE)`.

---

## 2. Tabela Mestra de Rastreabilidade Bi-Direcional

| Requisito Mestre | Requisito Funcional | Tela UI (SCR) | Endpoint API | Tabela Banco (DB) | Permissão RBAC | Job / Evento | Caso de Teste | Fase Roadmap | Status |
|---|---|---|---|---|---|---|---|---|:---:|
| **REQ-CONF-001** | **FR-001** (Login) | SCR-001 | API-001 (`POST /auth/login`) | DB-002 (`users`) | Nenhuma (Pública) | N/A | TEST-001 | PHASE-005 | PLANNED |
| **REQ-CONF-001** | **FR-005** (MFA) | SCR-001 | API-001 (`POST /auth/mfa`) | DB-002 (`users`) | Nenhuma (Desafio) | N/A | TEST-001 | PHASE-005 | PLANNED |
| **REQ-CONF-001** | **FR-007** (RBAC) | SCR-121 | API-001 (`GET /roles`) | DB-002 (`roles`) | `users:manage` | N/A | TEST-004 | PHASE-006 | PLANNED |
| **REQ-CONF-001** | **FR-010** (KPIs) | SCR-010 | API-004 (`GET /dashboard`) | Variadas | `dashboard:read` | N/A | TEST-007 | PHASE-009 | PLANNED |
| **REQ-CONF-001** | **FR-020** (Clientes) | SCR-020 | API-011 (`POST /clientes`) | DB-020 (`clients`) | `clients:write` | Event: `ClientCreated` | TEST-003 | PHASE-009 | PLANNED |
| **REQ-CONF-001** | **FR-030** (Kanban CRM)| SCR-030 | API-022 (`PATCH /leads/stage`)| DB-030 (`leads`) | `crm:write` | Event: `LeadStageUpdated`| TEST-005 | PHASE-009 | PLANNED |
| **REQ-CONF-001** | **FR-063** (Propostas) | SCR-060 | API-031 (`POST /propostas/app`)| DB-060 (`proposals`) | `proposals:approve` | JOB-002 (`pdf_queue`) | TEST-006 | PHASE-010 | PLANNED |
| **REQ-CONF-001** | **FR-072** (Tarefas) | SCR-070 | API-041 (`POST /tarefas`) | DB-070 (`tasks`) | `tasks:write` | Event: `TaskAssigned` | TEST-005 | PHASE-010 | PLANNED |
| **REQ-CONF-001** | **FR-080** (Financeiro) | SCR-080 | API-050 (`POST /lancamentos`)| DB-080 (`financial_transactions`)| `financial:write`| N/A | TEST-006 | PHASE-010 | PLANNED |
| **REQ-CONF-012** | **FR-101** (n8n Engine)| SCR-100 | API-060 (`POST /n8n/webhook`)| DB-100 (`outbox_events`)| `webhooks:n8n` | JOB-003 (`n8n_outbox`) | TEST-003 | PHASE-013 | PLANNED |
| **REQ-CONF-013** | **FR-141** (Ollama AI) | Sidebar | API-080 (`POST /ai/chat`) | N/A (Em Memória) | `ai:use` | JOB-004 (`ai_transcription`)| TEST-007 | PHASE-014 | PLANNED |
| **REQ-CONF-001** | **FR-120** (Storage) | SCR-110 | API-070 (`POST /upload`) | DB-120 (`files`) | `files:write` | N/A | TEST-008 | PHASE-011 | PLANNED |
| **REQ-CONF-009** | **FR-150** (Auditoria)| SCR-122 | API-080 (`GET /audit`) | DB-150 (`audit_logs`)| `audit:read` | N/A | TEST-008 | PHASE-016 | PLANNED |

---

## 3. Validação de Rastreabilidade

- **Zero Requisitos Órfãos:** 100% dos Requisitos Confirmados (REQ-CONF) e Requisitos Funcionais (FR) possuem mapeamento para pelo menos uma tela, endpoint, tabela de banco, teste e fase de implementação.
- **Zero Endpoints Sem Requisito:** 100% das rotas de API possuem finalidade funcional declarada.
- **Zero Tabelas Sem Utilidade:** 100% das tabelas do banco possuem módulo e casos de uso associados.
