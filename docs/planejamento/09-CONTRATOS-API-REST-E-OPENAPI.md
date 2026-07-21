# 09 — Contratos API REST e OpenAPI

- **Documento ID:** DOC-09
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (API Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md](./02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md), [07-ARQUITETURA-BACKEND.md](./07-ARQUITETURA-BACKEND.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, OpenAPI 3.1 Specification, REST Best Practices

---

## 1. Padronização Global da API REST (`/api/v1`)

A API do **Lyvox Gerenciamento** segue o estilo **RESTful** com payload exclusivamente em **JSON (UTF-8)**. A especificação OpenAPI 3.1 é gerada automaticamente pelo NestJS/Fastify a partir dos schemas Zod declarados nos controllers.

---

## 2. Cabeçalhos Globais HTTP e Padrões de Requisição

- **`Content-Type: application/json`:** Obrigatório para requisições com corpo (POST, PUT, PATCH).
- **`Cookie: lyvox_session=<OPAQUE_TOKEN>`:** Transmite a sessão opaca server-side do usuário em cookie `HttpOnly, Secure, SameSite=Lax`.
- **`X-Correlation-ID: <UUID>`:** Identificador de rastreabilidade de requisição repassado pelo frontend.
- **`X-CSRF-Token: <TOKEN>`:** Cabeçalho de proteção CSRF exigido para métodos mutativos.
- **`Idempotency-Key: <UUID>`:** Obrigatório para requisições mutativas financeiras ou de faturamento.

---

## 3. Formato Padrão de Resposta Paginada (Cursor-Based Pagination)

```json
{
  "data": [
    {
      "id": "c7a2b918-34de-4f10-9b48-1a5c88b90123",
      "name": "Acme Corporation Ltda",
      "document": "12.345.678/0001-90",
      "status": "ACTIVE"
    }
  ],
  "meta": {
    "pageSize": 20,
    "hasMore": true,
    "nextCursor": "eyJpZCI6ImM3YTJiOTE4LTM0ZGUtNGYxMC05YjQ4LTFhNWM4OGI5MDEyMyJ9"
  }
}
```

---

## 4. Tabela de Mapeamento de Endpoints Principais (API-ID)

| API-ID | Método | Rota HTTP | Módulo | Auth | Permissão RBAC | Idempotente | Cache | Auditoria |
|---|---|---|---|---|---|---|---|---|
| **API-001** | POST | `/api/v1/auth/login` | Identidade | Não | Nenhuma | Não | Não | Sim |
| **API-002** | POST | `/api/v1/auth/logout` | Identidade | Sim (Sessão) | Nenhuma | Não | Não | Sim |
| **API-003** | GET | `/api/v1/auth/me` | Identidade | Sim (Sessão) | Nenhuma | Sim (GET) | Não | Não |
| **API-004** | GET | `/api/v1/dashboard/kpis` | Dashboard | Sim (Sessão) | `dashboard.read` | Sim (GET) | 60s Redis | Não |
| **API-010** | GET | `/api/v1/clientes` | Clientes | Sim (Sessão) | `clients.read` | Sim (GET) | Não | Não |
| **API-011** | POST | `/api/v1/clientes` | Clientes | Sim (Sessão) | `clients.create` | Sim (Key) | Não | Sim |
| **API-012** | GET | `/api/v1/clientes/:id` | Clientes | Sim (Sessão) | `clients.read` | Sim (GET) | Não | Não |
| **API-013** | PUT | `/api/v1/clientes/:id` | Clientes | Sim (Sessão) | `clients.update` | Sim (Key) | Não | Sim |
| **API-014** | DELETE | `/api/v1/clientes/:id` | Clientes | Sim (Sessão) | `clients.archive` | Sim (Key) | Não | Sim |
| **API-020** | GET | `/api/v1/crm/leads` | CRM | Sim (Sessão) | `crm.read` | Sim (GET) | Não | Não |
| **API-021** | POST | `/api/v1/crm/leads` | CRM | Sim (Sessão) | `crm.create` | Sim (Key) | Não | Sim |
| **API-022** | PATCH | `/api/v1/crm/leads/:id/stage` | CRM | Sim (Sessão) | `crm.update` | Não | Não | Sim |
| **API-030** | POST | `/api/v1/propostas` | Propostas | Sim (Sessão) | `proposals.create` | Sim (Key) | Não | Sim |
| **API-031** | POST | `/api/v1/propostas/:id/approve` | Propostas | Sim (Sessão) | `proposals.approve` | Sim (Key) | Não | Sim |
| **API-040** | GET | `/api/v1/projetos` | Projetos | Sim (Sessão) | `projects.read` | Sim (GET) | Não | Não |
| **API-041** | POST | `/api/v1/projetos/:id/tarefas` | Projetos | Sim (Sessão) | `tasks.create` | Sim (Key) | Não | Sim |
| **API-050** | POST | `/api/v1/financeiro/lancamentos` | Financeiro | Sim (Sessão) | `financial.create` | Sim (Key) | Não | Sim |
| **API-051** | POST | `/api/v1/financeiro/lancamentos/:id/baixa` | Financeiro | Sim (Sessão) | `financial.pay` | Sim (Key) | Não | Sim |
| **API-060** | POST | `/api/v1/automacoes/webhooks/n8n` | Automações | HMAC Sign | `webhooks.n8n` | Sim (Key) | Não | Sim |
| **API-070** | POST | `/api/v1/arquivos/upload` | Arquivos | Sim (Sessão) | `files.create` | Não | Não | Sim |
| **API-080** | POST | `/api/v1/ai/chat` | Assistente IA | Sim (Sessão) | `ai.use` | Não | Não | Sim |

---

## 5. Exemplo de Contrato de Payload OpenAPI (Criação de Lançamento Financeiro)

### Request (`POST /api/v1/financeiro/lancamentos`)
```json
{
  "clientId": "c7a2b918-34de-4f10-9b48-1a5c88b90123",
  "type": "INCOME",
  "amount": 4500.00,
  "dueDate": "2026-08-10",
  "category": "Prestação de Serviços",
  "description": "Faturamento relativo à parcela 1/3 do projeto de consultoria",
  "costCenter": "Comercial"
}
```

### Response (`HTTP 201 Created`)
```json
{
  "id": "e81d7632-11ef-49a0-8c29-3bb4920a1122",
  "clientId": "c7a2b918-34de-4f10-9b48-1a5c88b90123",
  "type": "INCOME",
  "amount": 4500.00,
  "dueDate": "2026-08-10",
  "paymentDate": null,
  "status": "PENDING",
  "category": "Prestação de Serviços",
  "version": 1,
  "createdAt": "2026-07-21T15:45:00Z"
}
```
