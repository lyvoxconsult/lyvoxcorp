# 07 — Arquitetura Backend

- **Documento ID:** DOC-07
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Backend Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Fastify Official Documentation, Clean Architecture Guidelines

---

## 1. Visão Geral da Arquitetura Backend

O backend do **Lyvox Gerenciamento** é desenvolvido em **Node.js (v20 LTS)** utilizando o framework **Fastify** com **TypeScript**. A solução adota o padrão **Monólito Modular (Modulith)** com separação rigorosa em camadas dentro de cada módulo funcional (Clean Architecture / DDD prudente).

---

## 2. Estrutura de Diretórios do Backend (`apps/backend/`)

```text
apps/backend/
├── src/
│   ├── @types/                # Sobrescritas de tipos Fastify e plugins
│   ├── config/                # Validação de variáveis de ambiente via Zod (env.ts)
│   ├── core/                  # Abstrações base compartilhadas do sistema
│   │   ├── errors/            # Classes de Erros de Domínio (AppError, UnauthorizedError)
│   │   ├── events/            # Barramento de eventos em memória / Event Emitter
│   │   ├── guards/            # Fastify Pre-handlers (Auth Guard, RBAC Guard)
│   │   ├── logger/            # Configuração do Pino Logger com JSON estruturado
│   │   └── utils/             # Utilitários criptográficos e hash
│   ├── infrastructure/        # Adaptadores de Infraestrutura Global
│   │   ├── database/          # Conexão PostgreSQL (PgBouncer) e Drizzle Client
│   │   │   ├── migrations/    # Arquivos de migrations SQL gerados pelo Drizzle
│   │   │   ├── schema/        # Definição centralizada de tabelas Drizzle ORM
│   │   │   └── seed.ts        # Script de Bootstrap de Administrador e Categorias
│   │   ├── storage/           # Adaptador de Armazenamento Local / MinIO
│   │   ├── queue/             # Configuração de Conexão Redis e BullMQ
│   │   └── telemetry/         # Traces OpenTelemetry e Métricas Prometheus
│   ├── modules/               # Módulos Funcionais de Domínio (Modulith)
│   │   ├── auth/              # Módulo de Autenticação & Sessões
│   │   ├── clients/           # Módulo de Clientes
│   │   ├── crm/               # Módulo de Leads & Pipeline CRM
│   │   ├── meetings/          # Módulo de Reuniões
│   │   ├── proposals/         # Módulo de Propostas & Contratos
│   │   ├── projects/          # Módulo de Projetos, Tarefas & Timesheet
│   │   ├── financial/         # Módulo Financeiro (Contas a Pagar/Receber)
│   │   ├── marketing/         # Módulo de Marketing Editorial
│   │   ├── automations/       # Módulo de Automações & Engine n8n
│   │   ├── files/             # Módulo de Arquivos e Metadados
│   │   ├── ai/                # Módulo de Integração com Ollama Local AI
│   │   └── audit/             # Módulo de Trilha de Auditoria
│   ├── shared/                # DTOs e Interfaces compartilhadas entre módulos
│   ├── server.ts              # Inicialização do Servidor Fastify e Graceful Shutdown
│   └── app.ts                 # Registro de Plugins, Fastify Middlewares e Rotas
├── tests/                     # Testes de Integração e E2E Globais
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

---

## 3. Estrutura Interna de um Módulo Funcional

Cada módulo funcional localizado em `src/modules/<modulo>/` segue a divisão de 4 camadas bem definidas:

```text
src/modules/clients/
├── domain/                    # Entidades, Value Objects e Regras de Domínio puras
│   ├── client.entity.ts
│   └── client-cnpj.vo.ts
├── application/               # Casos de Uso (Use Cases / Services) e DTOs
│   ├── use-cases/
│   │   ├── create-client.use-case.ts
│   │   └── list-clients.use-case.ts
│   └── dtos/
│       └── create-client.dto.ts
├── infrastructure/            # Implementação de Repositórios com Drizzle ORM
│   └── client.repository.ts
├── http/                      # Controllers Fastify, Schemas Zod e Definição de Rotas
│   ├── client.controller.ts
│   ├── client.schema.ts
│   └── client.routes.ts
└── tests/                     # Testes Unitários e de Integração do Módulo
    └── create-client.spec.ts
```

---

## 4. Regras de Comunicação e Dependência entre Módulos

> [!IMPORTANT]
> **REGRAS DE COMUNICAÇÃO DE MÓDULOS (BOUNDED CONTEXTS):**
> 1. **Proibição de Acesso Direto às Tabelas Internas:** Um módulo (ex: `Projetos`) não pode consultar ou alterar diretamente tabelas SQL exclusivas de outro módulo (ex: `Clientes`) via SQL/ORM direto sem passar pela interface pública do serviço ou contrato exposto pelo módulo proprietário.
> 2. **Comunicação por Casos de Uso ou Eventos:** A comunicação entre domínios é realizada injetando as interfaces de serviços compartilhadas ou emitindo eventos assíncronos via barramento interno (`EventBus`).
> 3. **Independência de Transação SQL:** Operações transacionais que envolvem múltiplos domínios (ex: Aprovação de Proposta gerando Projeto e Lançamento Financeiro) devem ser orquestradas no Use Case da aplicação via gerenciador de transação trans-módulo ou padrão Outbox/Inboxing.

---

## 5. Envelope Padrão de Erro e Correlation ID

Todas as respostas de erro da API seguem o padrão inspirado no **RFC 7807 (Problem Details)**:

```json
{
  "type": "https://api.lyvox.com/errors/UNPROCESSABLE_ENTITY",
  "title": "Erro de Validação de Dados",
  "status": 422,
  "detail": "O CNPJ fornecido já está cadastrado para outro cliente ativo.",
  "instance": "/api/v1/clientes",
  "code": "CLIENT_CNPJ_DUPLICATED",
  "correlationId": "f04b2c12-38d4-4a2e-8b1e-92781b0a79cf",
  "timestamp": "2026-07-21T15:30:00Z",
  "validationErrors": [
    {
      "field": "cnpj",
      "message": "CNPJ já cadastrado"
    }
  ]
}
```

---

## 6. Endpoints de Verificação de Saúde (Health Check & Readiness)

- **GET `/health` (Liveness Probe):** Retorna `HTTP 200 OK` se o processo Node.js/Fastify estiver rodando e respondendo a requisições.
- **GET `/readiness` (Readiness Probe):** Retorna `HTTP 200 OK` somente se as conexões críticas com o PostgreSQL, Redis e PgBouncer estiverem ativas e funcionais. Caso contrário, retorna `HTTP 539 Service Unavailable`.
