# 21 — Roadmap de Implementação para o Codex

- **Documento ID:** DOC-21
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Lead Solution Architect & Technical PM)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** Todos os documentos anteriores (DOC-01 a DOC-20)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT

---

## 1. Diretrizes de Execução do Roadmap

Este roadmap estabelece a ordem **estrita, cronológica e dependente** de execução a ser seguida pelo agente executor **Codex**. 

> [!CAUTION]
> **REGRA DE OURO DE EXECUÇÃO:**
> O Codex é terminantemente proibido de avançar para a fase seguinte sem que todos os entregáveis, testes e **Quality Gates** da fase atual tenham sido integralmente concluídos, testados e validados.

---

## 2. Fases do Roadmap de Implementação (PHASE-000 a PHASE-021)

### PHASE-000: Preparação e Leitura do Pacote Documental
- **Objetivo:** Garantir o alinhamento de contexto e entendimento completo de todos os 29 documentos.
- **Pré-condições:** Liberação do repositório e disponibilidade dos documentos em `docs/planejamento/`.
- **Tarefas:** Leitura integral dos documentos DOC-00 a DOC-28. Leitura dos ADRs.
- **Entregáveis:** Relatório de confirmação de leitura emitido pelo Codex sem ressalvas ou divergências.
- **Gate:** `GATE-000` (Conformidade de Leitura 100%).

### PHASE-001: Estruturação do Repositório e Monorepo
- **Objetivo:** Inicializar o monorepo pnpm workspaces com Turborepo e configurações base de TypeScript, ESLint e Prettier.
- **Pré-condições:** PHASE-000 concluída.
- **Tarefas:** Criar diretórios `apps/frontend`, `apps/backend`, `packages/config`. Criar `pnpm-workspace.yaml`, `package.json` raiz e `tsconfig.base.json`.
- **Entregáveis:** Monorepo configurado e executando `pnpm install` sem erros.
- **Gate:** `GATE-001` (Monorepo Bootstrap Validado).

### PHASE-002: Configuração do Ambiente Local de Desenvolvimento
- **Objetivo:** Subir infraestrutura local via Docker Compose.
- **Pré-condições:** PHASE-001 concluída.
- **Tarefas:** Criar `docker-compose.yml` local contendo PostgreSQL 16, Redis 7 e PgBouncer.
- **Entregáveis:** Contêineres rodando e saudáveis localmente.
- **Gate:** `GATE-002` (Local Environment Ready).

### PHASE-003: Infraestrutura Base e Logger Backend
- **Objetivo:** Criar aplicação backend Fastify com TypeScript, Pino Logger e tratamento global de exceções.
- **Pré-condições:** PHASE-002 concluída.
- **Tarefas:** Configurar servidor Fastify em `apps/backend`, adicionar Zod env validation, middleware de Correlation ID e error handler RFC 7807.
- **Entregáveis:** API escutando na porta 4000 e respondendo aos endpoints `/health` e `/readiness`.
- **Gate:** `GATE-003` (Fastify Base Server Ready).

### PHASE-004: PostgreSQL, Drizzle ORM e Migrations Initial
- **Objetivo:** Estabelecer a camada de dados com Drizzle ORM e executar as migrations base.
- **Pré-condições:** PHASE-003 concluída.
- **Tarefas:** Declarar schemas Drizzle para todas as tabelas (DOC-08), gerar e executar migration `0001_initial_schema.sql`.
- **Entregáveis:** Tabelas criadas no PostgreSQL local com FKs, PKs UUID, índices e constraints.
- **Gate:** `GATE-004` (Database Schema Initialized).

### PHASE-005: Módulo de Autenticação (Auth Engine)
- **Objetivo:** Implementar fluxos de login, logout, refresh token em Redis e hash de senhas Argon2id.
- **Pré-condições:** PHASE-004 concluída.
- **Tarefas:** Implementar Use Cases de login/logout/refresh, cookies HTTP-Only, JWT RS256/HS256 e MFA TOTP.
- **Entregáveis:** Endpoints `/api/v1/auth/*` 100% funcionais e testados.
- **Gate:** `GATE-005` (Auth Engine Complete).

### PHASE-006: Módulo RBAC e Guardas de Permissão
- **Objetivo:** Aplicar controle de acesso granular por papel e organização em todas as rotas Fastify.
- **Pré-condições:** PHASE-005 concluída.
- **Tarefas:** Implementar middleware `rbacGuard`, matriz de permissões e isolamento por `organization_id`.
- **Entregáveis:** Bloqueio HTTP 403 funcional para permissões negadas em testes automatizados.
- **Gate:** `GATE-006` (RBAC & Multi-Tenancy Enforced).

### PHASE-007: Fundação de API e OpenAPI Spec
- **Objetivo:** Configurar Swagger/OpenAPI 3.1 automático e padrões de paginação por cursor.
- **Pré-condições:** PHASE-006 concluída.
- **Tarefas:** Integrar `@fastify/swagger` e `@fastify/swagger-ui`, padronizar paginação e de-duplicação por `Idempotency-Key`.
- **Entregáveis:** Rota `/docs` exposta com OpenAPI interativo funcional.
- **Gate:** `GATE-007` (API Infrastructure Complete).

### PHASE-008: Fundação Frontend SPA (React + Vite + Design System)
- **Objetivo:** Construir a base do frontend com Tailwind CSS, Design System Dark Mode e React Router.
- **Pré-condições:** PHASE-007 concluída.
- **Tarefas:** Inicializar Vite em `apps/frontend`, implementar tokens de cores (DOC-04), componentes base (Button, Input, Table, Modal) e layout base (Sidebar, Header).
- **Entregáveis:** Frontend inicial compilando sem erros e exibindo layout base.
- **Gate:** `GATE-008` (Frontend Foundations & Design System Ready).

### PHASE-009: Módulos de Negócio P0 (Dashboard, Clientes, CRM)
- **Objetivo:** Construir a camada completa (UI + API + DB) dos módulos vitais de negócio.
- **Pré-condições:** PHASE-008 concluída.
- **Tarefas:** Implementar CRUD e telas de Clientes, Kanban de Leads CRM e Dashboard com KPI Cards.
- **Entregáveis:** Módulos P0 integrados e operacionais end-to-end.
- **Gate:** `GATE-009` (Core P0 Modules Functional).

### PHASE-010: Módulos de Negócio P1 (Propostas, Projetos, Financeiro, Reuniões)
- **Objetivo:** Implementar os módulos de operação, contratos, tarefas e controle financeiro.
- **Pré-condições:** PHASE-009 concluída.
- **Tarefas:** Implementar Propostas, Projetos com Kanban/Lista, Contas a Pagar/Receber e Agendamento de Reuniões.
- **Entregáveis:** Módulos P1 integrados com validações de negócio (BR-050, BR-070, BR-080).
- **Gate:** `GATE-010` (Core P1 Modules Functional).

### PHASE-011: Módulo de Arquivos e Storage Privado
- **Objetivo:** Implementar a gestão de upload, download e metadados de arquivos privados.
- **Pré-condições:** PHASE-010 concluída.
- **Tarefas:** Criar controlador de arquivos com validação de Magic Bytes, checksum SHA-256 e download via stream autenticada.
- **Entregáveis:** Sistema de anexos e documentos operacional.
- **Gate:** `GATE-011` (Storage System Operational).

### PHASE-012: Motor de Filas Assíncronas (BullMQ & Workers)
- **Objetivo:** Implementar o processador de jobs em background com Redis e BullMQ.
- **Pré-condições:** PHASE-011 concluída.
- **Tarefas:** Criar contêiner de Worker dedicado, filas `email_queue`, `pdf_queue` e tratamento de Dead Letter Queue (DLQ).
- **Entregáveis:** Geração de PDFs e envios de e-mail ocorrendo de forma assíncrona.
- **Gate:** `GATE-012` (Background Workers Operational).

### PHASE-013: Integração com n8n Local e Webhooks Assinados
- **Objetivo:** Conectar a aplicação ao motor n8n local via Outbox Pattern e HMAC.
- **Pré-condições:** PHASE-012 concluída.
- **Tarefas:** Implementar processador Outbox, disparo de webhooks assinados com HMAC-SHA256 e endpoint de recepção callback.
- **Entregáveis:** Integração n8n testada com garantia de entrega e retries.
- **Gate:** `GATE-013` (n8n Integration Verified).

### PHASE-014: Camada de Inteligência Artificial (Ollama Local)
- **Objetivo:** Integrar o assistente virtual e geração de cópias/atas via Ollama local.
- **Pré-condições:** PHASE-013 concluída.
- **Tarefas:** Conectar SDK ao Ollama local, implementar fallback para aviso amigável e fila de transcrição.
- **Entregáveis:** Chat de IA e resumos de reunião funcionais em modo local.
- **Gate:** `GATE-014` (AI Engine Operational).

### PHASE-015: Observabilidade e Coleta de Métricas/Logs
- **Objetivo:** Instrumentar a aplicação com OpenTelemetry, Prometheus e Pino Loki.
- **Pré-condições:** PHASE-014 concluída.
- **Tarefas:** Adicionar exportadores OpenTelemetry no Fastify, métricas Prometheus e logs JSON estruturados.
- **Entregáveis:** Painéis no Grafana exibindo métricas e traces em tempo real.
- **Gate:** `GATE-015` (Observability & Monitoring Active).

### PHASE-016: Hardening de Segurança e Auditoria Final
- **Objetivo:** Aplicar travas finais de segurança (OWASP) e trilha de auditoria completa.
- **Pré-condições:** PHASE-015 concluída.
- **Tarefas:** Auditar cabeçalhos de segurança (CSP, HSTS), rate limiters, sanidade de sanitização e tabela de auditoria imutável (`audit_logs`).
- **Entregáveis:** Relatório de varredura de segurança sem vulnerabilidades críticas.
- **Gate:** `GATE-016` (Security Hardening Complete).

### PHASE-017: Testes de Carga, Stress e Performance (k6)
- **Objetivo:** Validar a capacidade do sistema sob carga sustentada de 100 RPS e 500 VUs.
- **Pré-condições:** PHASE-016 concluída.
- **Tarefas:** Executar scripts k6 de carga, stress e soak test no ambiente de testes.
- **Entregáveis:** Relatório de testes k6 comprovando P95 < 200ms e 0% de erro.
- **Gate:** `GATE-017` (Performance Targets Validated).

### PHASE-018: Implantação e Validação em Staging
- **Objetivo:** Realizar deploy completo no ambiente de homologação (Staging VPS).
- **Pré-condições:** PHASE-017 concluída.
- **Tarefas:** Executar pipeline de CI/CD para staging, rodar migrations e executar suíte de testes E2E Playwright.
- **Entregáveis:** Sistema Staging 100% idêntico à produção operacional.
- **Gate:** `GATE-018` (Staging Environment Approved).

### PHASE-019: Homologação e Testes de Aceite (UAT)
- **Objetivo:** Validação funcional completa com dados de teste representativos.
- **Pré-condições:** PHASE-018 concluída.
- **Tarefas:** Execução de checklist mestre de aceite (DOC-27) em todas as telas e fluxos.
- **Entregáveis:** Sign-off formal de homologação aprovado.
- **Gate:** `GATE-019` (User Acceptance Testing Complete).

### PHASE-020: Deploy de Produção e Lançamento
- **Objetivo:** Realizar o deploy oficial na VPS de Produção.
- **Pré-condições:** PHASE-019 concluída.
- **Tarefas:** Executar deploy zero-downtime, bootstrap de dados essenciais e configuração de TLS Caddy.
- **Entregáveis:** Sistema Lyvox Gerenciamento no ar no domínio oficial de produção.
- **Gate:** `GATE-020` (Production Release Active).

### PHASE-021: Estabilização e Pós-Lançamento (Hypercare)
- **Objetivo:** Monitoramento intensivo de 72 horas pós-lançamento.
- **Pré-condições:** PHASE-020 concluída.
- **Tarefas:** Acompanhar métricas de erro, uso de memória, integridade de backups e feedback inicial.
- **Entregáveis:** Relatório final de estabilização sem bugs críticos abertos.
- **Gate:** `GATE-021` (System Stabilization Complete).
