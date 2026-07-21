# 21 — Roadmap de Implementação para o Codex

- **Documento ID:** DOC-21
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Lead Solution Architect & Technical PM)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** Todos os documentos do pacote (DOC-00 a DOC-20)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT

---

## 1. Diretrizes de Execução do Roadmap

Este roadmap estabelece a ordem **estrita, cronológica e dependente** de execução (PHASE-000 a PHASE-030) a ser seguida pelo agente executor **Codex**. 

> [!CAUTION]
> **REGRA DE OURO DE EXECUÇÃO:**
> O Codex é terminantemente proibido de avançar para a fase seguinte sem que todos os entregáveis, testes e **Quality Gates** da fase atual tenham sido integralmente concluídos e validados.

---

## 2. Fases Sequenciais do Roadmap (PHASE-000 a PHASE-030)

### PHASE-000: Leitura e Validação Documental
- **Objetivo:** Alinhamento de contexto e confirmação da integridade de todos os 29 documentos.
- **Inputs:** Pacote documental em `./docs/planejamento/`.
- **Tarefas:** Leitura integral dos documentos DOC-00 a DOC-28. Leitura dos ADRs.
- **Arquivos:** N/A (Read-only).
- **Entregáveis:** Relatório de confirmação de leitura emitido pelo Codex.
- **Testes:** Validação de checksum dos 29 arquivos.
- **Gate:** `GATE-000` (Conformidade de Leitura 100%).
- **Rollback:** Parada imediata em caso de incoerência documental.
- **Condições de Bloqueio:** Existência de arquivo corrompido ou ausente.
- **Definition of Done:** 100% dos documentos lidos sem ressalvas.

### PHASE-001: Novo Repositório Separado
- **Objetivo:** Inicializar o novo repositório limpo do projeto.
- **Inputs:** Diretrizes de Greenfield.
- **Tarefas:** Criar novo repositório isolado sem dependência do projeto legado.
- **Arquivos:** `.gitignore`, `README.md`, `LICENSE`.
- **Entregáveis:** Repositório git inicializado.
- **Testes:** Execução de `git status`.
- **Gate:** `GATE-001` (Clean Repo Initialized).

### PHASE-002: Estrutura de Monorepo (pnpm + Turborepo)
- **Objetivo:** Configurar a estrutura de pacotes e aplicações.
- **Inputs:** Especificação do monorepo (DOC-05).
- **Tarefas:** Criar `apps/web`, `apps/api`, `apps/worker`, `packages/config`, `packages/validation`, `packages/shared`. Configurar `pnpm-workspace.yaml` e Turborepo.
- **Arquivos:** `pnpm-workspace.yaml`, `turbo.json`, `package.json` raiz.
- **Entregáveis:** Monorepo configurado.
- **Testes:** Execução de `pnpm install` sem erros.
- **Gate:** `GATE-002` (Monorepo Bootstrap Ready).

### PHASE-003: Configuração do Desenvolvimento Local
- **Objetivo:** Configurar scripts de dev local.
- **Inputs:** DOC-18.
- **Tarefas:** Criar scripts de inicialização simultânea dos workspaces.
- **Arquivos:** `package.json` scripts (`pnpm dev`).
- **Entregáveis:** Ambiente de dev unificado.
- **Testes:** Verificação de execução concorrente dos scripts.
- **Gate:** `GATE-003` (Local Dev Script Ready).

### PHASE-004: Infraestrutura Local (Docker Compose)
- **Objetivo:** Subir infraestrutura local em contêineres.
- **Inputs:** DOC-14.
- **Tarefas:** Criar `docker-compose.yml` contendo PostgreSQL 16, Redis 7, PgBouncer e Mailpit.
- **Arquivos:** `docker-compose.yml`, `docker-compose.override.yml`.
- **Entregáveis:** Contêineres de suporte locais rodando e saudáveis.
- **Testes:** Conexão TCP com PostgreSQL, Redis e Mailpit.
- **Gate:** `GATE-004` (Local Containers Healthy).

### PHASE-005: PostgreSQL 16 e Migrations Iniciais
- **Objetivo:** Estabelecer a camada de persistência mestre.
- **Inputs:** Dicionário de Dados (DOC-08).
- **Tarefas:** Declarar schemas Drizzle ORM para todas as tabelas (DOC-08) e gerar migration `0001_initial_schema.sql`.
- **Arquivos:** `packages/database/src/schema/*`, `migrations/0001_initial_schema.sql`.
- **Entregáveis:** Schemas e tabelas criados no PostgreSQL.
- **Testes:** Execução de `pnpm db:migrate` sem erros.
- **Gate:** `GATE-005` (Database Migration Success).

### PHASE-006: Autenticação e Sessões Opacas Server-Side
- **Objetivo:** Implementar a engine de autenticação baseada em sessões opacas.
- **Inputs:** DOC-10.
- **Tarefas:** Implementar login, logout, revogação de sessão, cookies `HttpOnly, Secure, SameSite=Lax`, hash Argon2id e ativador MFA TOTP.
- **Arquivos:** `apps/api/src/modules/auth/*`, `packages/auth/*`.
- **Entregáveis:** Rotas `/api/v1/auth/*` 100% funcionais.
- **Testes:** Testes unitários e de integração de autenticação (`Vitest`).
- **Gate:** `GATE-006` (Opaque Session Auth Verified).

### PHASE-007: Autorização RBAC e Scope Ownership
- **Objetivo:** Implementar controle de acesso granular por papéis.
- **Inputs:** DOC-10 (Matriz RBAC).
- **Tarefas:** Criar middleware `RbacGuard`, matriz de permissões (`recurso.ação`) e controle de ownership.
- **Arquivos:** `apps/api/src/core/guards/rbac.guard.ts`, `packages/permissions/*`.
- **Entregáveis:** Bloqueio HTTP 403 funcional para acessos negados.
- **Testes:** Testes de integração simulando os 5 papéis iniciais.
- **Gate:** `GATE-007` (RBAC Authorization Enforced).

### PHASE-008: Backend Foundation (NestJS + Fastify)
- **Objetivo:** Estruturar a fundação da API REST.
- **Inputs:** DOC-07 e DOC-09.
- **Tarefas:** Configurar servidor NestJS/Fastify, middleware de Correlation ID, envelope de erro RFC 7807 e OpenAPI Swagger `/docs`.
- **Arquivos:** `apps/api/src/main.ts`, `apps/api/src/app.module.ts`.
- **Entregáveis:** API escutando e respondendo em `/health` e `/readiness`.
- **Testes:** Testes HTTP de infraestrutura e OpenAPI spec.
- **Gate:** `GATE-008` (Backend Foundation Ready).

### PHASE-009: Frontend Foundation (React 19 + Vite + Design System)
- **Objetivo:** Estruturar a fundação do frontend SPA.
- **Inputs:** DOC-04 e DOC-06.
- **Tarefas:** Configurar Vite em `apps/web/`, Design Tokens Tailwind (com paleta `#4180ab`, `#ffffff`, `#8ab3cf`, `#bdd1de`, `#e4ebf0` e Google Fonts `Cormorant SC`, `Alegreya SC`, `Rasa`, `JetBrains Mono`), componentes base e layout (Sidebar, Header).
- **Arquivos:** `apps/web/src/*`, `tailwind.config.js`.
- **Entregáveis:** Frontend compilando e exibindo layout base.
- **Testes:** Build Vite sem erros e testes de componentes visual.
- **Gate:** `GATE-009` (Frontend Foundation & Tokens Ready).

### PHASE-010 a PHASE-019: Módulos Funcionais de Negócio
- **PHASE-010 (Clientes):** Cadastro de clientes PF/PJ, validação de CPF/CNPJ e busca. (`GATE-010`).
- **PHASE-011 (Leads e CRM):** Funil de vendas Kanban, troca de etapas e conversão. (`GATE-011`).
- **PHASE-012 (Reuniões):** Agendamento, pauta e anexos de reuniões. (`GATE-012`).
- **PHASE-013 (Serviços):** Catálogo de serviços e versionamento de preços. (`GATE-013`).
- **PHASE-014 (Propostas e Contratos):** Gerador de propostas, exportação em PDF e conversão em contrato. (`GATE-014`).
- **PHASE-015 (Projetos e Tarefas):** Gestão de projetos, visualização Lista/Kanban/Calendário/Gantt e subtarefas (`parent_task_id`). (`GATE-015`).
- **PHASE-016 (Financeiro):** Contas a pagar/receber, baixas e fluxo de caixa gerencial. (`GATE-016`).
- **PHASE-017 (Marketing):** Ideias e calendário editorial. (`GATE-017`).
- **PHASE-018 (Notificações):** Central in-app e e-mails transacionais. (`GATE-018`).
- **PHASE-019 (Arquivos):** Upload/download seguro em storage privado em disco com validação Magic Bytes. (`GATE-019`).

### PHASE-020: Filas Assíncronas e Engine de Automação
- **Objetivo:** Processamento de jobs em segundo plano via BullMQ em processo separado (`apps/worker/`).
- **Inputs:** DOC-11.
- **Tarefas:** Implementar workers de e-mail, PDF, relatórios e DLQ.
- **Entregáveis:** Processador de jobs assíncronos operacional.
- **Gate:** `GATE-020` (Async Workers Operational).

### PHASE-021: Integração com n8n Local
- **Objetivo:** Conectar a aplicação ao motor n8n local via Transactional Outbox.
- **Inputs:** DOC-13.
- **Tarefas:** Implementar processador outbox, disparo de webhooks assinados com HMAC-SHA256 e callback inbox.
- **Gate:** `GATE-021` (n8n Integration Verified).

### PHASE-022: Camada de Inteligência Artificial Local (Ollama)
- **Objetivo:** Conectar assistente virtual ao Ollama local em modo degradado sem fallback pago.
- **Inputs:** DOC-13.
- **Gate:** `GATE-022` (Ollama AI Operational).

### PHASE-023: Trilha de Auditoria e Logs Imutáveis
- **Objetivo:** Implementar a tabela imutável `audit_logs` para registro de ações sensíveis.
- **Inputs:** DOC-10 e DOC-16.
- **Gate:** `GATE-023` (Audit Logging Active).

### PHASE-024: Instrumentação de Observabilidade
- **Objetivo:** Instrumentar Pino JSON, métricas Prometheus e exportadores OpenTelemetry.
- **Inputs:** DOC-15.
- **Gate:** `GATE-024` (Observability Instrumentated).

### PHASE-025: Hardening de Segurança (OWASP)
- **Objetivo:** Validação final de segurança (CSP, HSTS, rate limiters, sanitização).
- **Inputs:** DOC-10.
- **Gate:** `GATE-025` (Security Hardening Passed).

### PHASE-026: Testes de Carga e Performance (k6)
- **Objetivo:** Execução de suíte de testes k6 validando latência P95 < 250ms e throughput de 100 RPS.
- **Inputs:** DOC-16.
- **Gate:** `GATE-026` (Performance Benchmark Passed).

### PHASE-027: Deploy no Ambiente de Staging
- **Objetivo:** Deploy e validação em ambiente de homologação idêntico à produção.
- **Inputs:** DOC-18 e DOC-20.
- **Gate:** `GATE-027` (Staging Deployed).

### PHASE-028: Homologação e Testes de Aceite (UAT)
- **Objetivo:** Execução completa do Checklist Mestre de Aceite (DOC-27).
- **Inputs:** DOC-27.
- **Gate:** `GATE-028` (UAT Approved).

### PHASE-029: Deploy em Produção (Janela Controlada)
- **Objetivo:** Deploy oficial na VPS de Produção da Lyvox.
- **Inputs:** DOC-14 e DOC-20.
- **Gate:** `GATE-029` (Production Released).

### PHASE-030: Estabilização e Pós-Lançamento (Hypercare)
- **Objetivo:** Monitoramento intensivo de 72 horas pós-lançamento.
- **Inputs:** DOC-15 e DOC-25.
- **Gate:** `GATE-030` (System Stabilized).
