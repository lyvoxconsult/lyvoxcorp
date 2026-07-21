# 07 — Arquitetura Backend

- **Documento ID:** DOC-07
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Backend Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](./05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, NestJS Official Documentation, Fastify Guide, Clean Architecture

---

## 1. Visão Geral da Arquitetura Backend

O backend do **Lyvox Gerenciamento** é desenvolvido em **Node.js (v20 LTS)** utilizando **NestJS com adaptador Fastify** e **TypeScript** (`apps/api/`). A solução adota o padrão **Monólito Modular (Modulith)** com separação rigorosa em camadas dentro de cada módulo funcional.

---

## 2. Estrutura de Diretórios do Backend (`apps/api/`)

```text
apps/api/
├── src/
│   ├── config/                # Validação de variáveis de ambiente via Zod (env.ts)
│   ├── core/                  # Abstrações base compartilhadas do sistema
│   │   ├── errors/            # Classes de Erros de Domínio (AppError, UnauthorizedError)
│   │   ├── events/            # Barramento de eventos em memória (EventBus)
│   │   ├── guards/            # Guards de Autenticação e RBAC (AuthGuard, RbacGuard)
│   │   ├── logger/            # Pino Logger com formato JSON estruturado
│   │   └── utils/             # Utilitários criptográficos e hash Argon2id
│   ├── infrastructure/        # Adaptadores de Infraestrutura Global
│   │   ├── database/          # Conexão PostgreSQL (PgBouncer) e Drizzle Client
│   │   │   ├── migrations/    # Migration SQLs versionadas geradas pelo Drizzle
│   │   │   └── seed.ts        # Script de Bootstrap do Administrador Inicial
│   │   ├── storage/           # Adaptador de Armazenamento Privado em Disco
│   │   ├── queue/             # Configuração de Conexão Redis e BullMQ
│   │   └── telemetry/         # Instrumentação OpenTelemetry e Métricas Prometheus
│   ├── modules/               # Módulos Funcionais de Domínio (Modulith)
│   │   ├── auth/              # Módulo de Autenticação & Sessões Opacas
│   │   ├── clients/           # Módulo de Clientes
│   │   ├── crm/               # Módulo de Leads & Pipeline CRM
│   │   ├── meetings/          # Módulo de Reuniões
│   │   ├── proposals/         # Módulo de Propostas & Contratos
│   │   ├── projects/          # Módulo de Projetos & Tarefas
│   │   ├── financial/         # Módulo Financeiro (Contas a Pagar/Receber)
│   │   ├── marketing/         # Módulo de Marketing Editorial
│   │   ├── automations/       # Módulo de Automações & Engine n8n
│   │   ├── files/             # Módulo de Arquivos Privados
│   │   ├── ai/                # Módulo de Integração com Ollama Local AI
│   │   └── audit/             # Módulo de Trilha de Auditoria Imutável
│   ├── main.ts                # Inicialização do Servidor NestJS/Fastify e Graceful Shutdown
│   └── app.module.ts          # Módulo Raiz da Aplicação
├── tests/                     # Testes de Integração e E2E Globais
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

---

## 3. Estrutura Interna de um Módulo Funcional

Cada módulo localizado em `src/modules/<modulo>/` segue a divisão de 5 camadas bem definidas:

```text
src/modules/clients/
├── domain/                    # Entidades e Regras de Domínio puras
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
├── interfaces/
│   └── http/                  # Controllers NestJS/Fastify, Schemas Zod e Rotas REST
│       ├── client.controller.ts
│       └── client.schema.ts
└── tests/                     # Testes Unitários e de Integração do Módulo
    └── create-client.spec.ts
```

---

## 4. Regras de Comunicação e Dependência entre Módulos

> [!IMPORTANT]
> **REGRAS DE COMUNICAÇÃO DE MÓDULOS (BOUNDED CONTEXTS):**
> 1. **Proibição de Acesso Direto às Tabelas Internas:** Um módulo (ex: `Projetos`) não pode consultar ou alterar diretamente tabelas SQL exclusivas de outro módulo (ex: `Clientes`) sem passar pela interface do serviço ou contrato exposto pelo módulo proprietário.
> 2. **Comunicação por Casos de Uso ou Eventos:** A comunicação entre domínios é realizada injetando as interfaces de serviços compartilhadas ou emitindo eventos assíncronos via barramento interno (`EventBus`).
> 3. **Independência de Transação SQL:** Operações transacionais que envolvem múltiplos domínios (ex: Aprovação de Proposta gerando Contrato e Lançamento Financeiro) são orquestradas no Use Case da aplicação via gerenciador de transação ou padrão Outbox/Inbox.

---

## 5. Envelope Padrão de Erro e Correlation ID

Todas as respostas de erro da API seguem o padrão **RFC 7807 (Problem Details)**:

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

- **GET `/health` (Liveness Probe):** Retorna `HTTP 200 OK` se o processo Node.js/NestJS estiver rodando e respondendo.
- **GET `/readiness` (Readiness Probe):** Retorna `HTTP 200 OK` somente se as conexões com o PostgreSQL, Redis e PgBouncer estiverem ativas e funcionais.
