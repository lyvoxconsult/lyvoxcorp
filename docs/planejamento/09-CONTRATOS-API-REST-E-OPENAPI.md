# 09 — Contratos API REST e OpenAPI

- **Documento ID:** DOC-09
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (API Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md), [07-ARQUITETURA-BACKEND.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/07-ARQUITETURA-BACKEND.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, OpenAPI 3.1 Specification, REST Best Practices

---

## 1. Padronização Global da API REST (`/api/v1`)

A API do **Lyvox Gerenciamento** segue o estilo arquitetural **RESTful** com formato de troca de dados exclusivamente em **JSON (UTF-8)**. Toda a especificação OpenAPI 3.1 é gerada automaticamente pelo Fastify a partir dos schemas Zod declarados nos controllers.

---

## 2. Cabeçalhos Globais HTTP e Padrões de Requisição

- **`Content-Type: application/json`:** Obrigatório para métodos com corpo de requisição (POST, PUT, PATCH).
- **`Authorization: Bearer <JWT_ACCESS_TOKEN>`:** Transmite a credencial de acesso do usuário.
- **`X-Correlation-ID: <UUID>`:** Identificador de rastreabilidade de requisição repassado pelos microserviços/frontend.
- **`Idempotency-Key: <UUID>`:** Obrigatório para requisições mutativas financeiras ou de faturamento (POST/PUT), garantindo que requisições duplicadas por falha de rede sejam executadas exatamente uma vez.

---

## 3. Formato Padrão de Resposta Pagina (Cursor-Based Pagination)

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
| **API-002** | POST | `/api/v1/auth/logout` | Identidade | Sim | Nenhuma | Não | Não | Sim |
| **API-003** | POST | `/api/v1/auth/refresh` | Identidade | Sim (Cookie) | Nenhuma | Não | Não | Não |
| **API-004** | GET | `/api/v1/dashboard/kpis` | Dashboard | Sim | `dashboard:read` | Sim (GET) | 60s Redis | Não |
| **API-010** | GET | `/api/v1/clientes` | Clientes | Sim | `clients:read` | Sim (GET) | Não | Não |
| **API-011** | POST | `/api/v1/clientes` | Clientes | Sim | `clients:write` | Sim (Key) | Não | Sim |
| **API-012** | GET | `/api/v1/clientes/:id` | Clientes | Sim | `clients:read` | Sim (GET) | Não | Não |
| **API-013** | PUT | `/api/v1/clientes/:id` | Clientes | Sim | `clients:write` | Sim (Key) | Não | Sim |
| **API-014** | DELETE | `/api/v1/clientes/:id` | Clientes | Sim | `clients:delete` | Sim (Key) | Não | Sim |
| **API-020** | GET | `/api/v1/crm/leads` | CRM | Sim | `crm:read` | Sim (GET) | Não | Não |
| **API-021** | POST | `/api/v1/crm/leads` | CRM | Sim | `crm:write` | Sim (Key) | Não | Sim |
| **API-022** | PATCH | `/api/v1/crm/leads/:id/stage` | CRM | Sim | `crm:write` | Não | Não | Sim |
| **API-030** | POST | `/api/v1/propostas` | Propostas | Sim | `proposals:write` | Sim (Key) | Não | Sim |
| **API-031** | POST | `/api/v1/propostas/:id/approve` | Propostas | Sim / Public | `proposals:approve` | Sim (Key) | Não | Sim |
| **API-040** | GET | `/api/v1/projetos` | Projetos | Sim | `projects:read` | Sim (GET) | Não | Não |
| **API-041** | POST | `/api/v1/projetos/:id/tarefas` | Projetos | Sim | `tasks:write` | Sim (Key) | Não | Sim |
| **API-050** | POST | `/api/v1/financeiro/lancamentos` | Financeiro | Sim | `financial:write` | Sim (Key) | Não | Sim |
| **API-051** | POST | `/api/v1/financeiro/lancamentos/:id/baixa` | Financeiro | Sim | `financial:write` | Sim (Key) | Não | Sim |
| **API-060** | POST | `/api/v1/automacoes/webhooks/n8n` | Automações | Hmac Sign | `webhooks:n8n` | Sim (Key) | Não | Sim |
| **API-070** | POST | `/api/v1/arquivos/upload` | Arquivos | Sim | `files:write` | Não | Não | Sim |
| **API-080** | POST | `/api/v1/ai/chat` | Assistente IA | Sim | `ai:use` | Não | Não | Sim |

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
  "organizationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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
