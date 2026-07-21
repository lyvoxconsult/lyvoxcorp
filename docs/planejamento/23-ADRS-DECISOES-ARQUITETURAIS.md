# 23 — ADRs: Registros de Decisões Arquiteturais (Architectural Decision Records)

- **Documento ID:** DOC-23
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Chief Software Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](./05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, Michael Nygard ADR Template

---

## ADR-001: Adoção do Estilo Arquitetural Monólito Modular (Modulith)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** O sistema necessita suportar múltiplos módulos empresariais mantendo simplicidade operacional em VPS única.
- **Opções Avaliadas:** 1. Microsserviços Distribuídos; 2. Monólito Tradicional Não Estruturado; 3. Monólito Modular.
- **Critérios:** Latência de comunicação, complexidade de deploy, integridade transacional ACID.
- **Decisão:** Adotar **Monólito Modular (Modulith)**. O código é organizado em módulos de domínio isolados em `apps/api/src/modules/`.
- **Consequências:** Deploy único em contêiner, transações ACID nativas e latência mínima em memória.
- **Riscos:** Exige disciplina da equipe para respeitar os limites de módulos.
- **Gatilho de Revisão:** Necessidade de escalar equipes em mais de 5 times isolados.
- **Fontes Oficiais:** [Modular Monoliths (Martin Fowler)](https://martinfowler.com/bliki/MonolithFirst.html) [Acesso em 21/07/2026].

---

## ADR-002: Escolha da Stack Frontend (React 19 + Vite + TypeScript)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** A interface exige alta reatividade e desacoplamento total do backend.
- **Opções Avaliadas:** 1. Next.js (App Router); 2. React 19 + Vite SPA; 3. Vue 3 + Vite.
- **Decisão:** Adotar **React 19 + Vite + TypeScript SPA** (`apps/web/`).
- **Consequências:** Compilação ultrarrápida, servidor web estático servido pelo Caddy e total desacoplamento.
- **Riscos:** Necessidade de gerenciar roteamento exclusivamente no cliente.
- **Gatilho de Revisão:** Exigência de SEO público indexável dinâmico.
- **Fontes Oficiais:** [React Documentation](https://react.dev/), [Vite Guide](https://vitejs.dev/) [Acesso em 21/07/2026].

---

## ADR-003: Escolha do Framework Backend (NestJS com Adaptador Fastify)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Backend estruturado e opinativo em TypeScript com baixa latência.
- **Opções Avaliadas:** 1. Express.js; 2. NestJS com Fastify Adapter; 3. Fastify puro; 4. Go (Gin).
- **Decisão:** Adotar **NestJS com adaptador Fastify** (`apps/api/`).
- **Consequências:** Estrutura modular limpa e opinativa aliada ao alto desempenho e baixo overhead de memória do Fastify.
- **Gatilho de Revisão:** Reescrita de módulos pesados em linguagem compilada (Go/Rust).
- **Fontes Oficiais:** [NestJS Performance (Fastify)](https://docs.nestjs.com/techniques/performance) [Acesso em 21/07/2026].

---

## ADR-004: Adoção do Monorepo com pnpm Workspaces e Turborepo

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Compartilhamento direto de schemas Zod e DTOs entre frontend e backend.
- **Decisão:** Adotar **pnpm Workspaces + Turborepo**.
- **Consequências:** Builds incrementais com cache rápido e reinstalações eficientes.
- **Fontes Oficiais:** [Turborepo Documentation](https://turbo.build/repo) [Acesso em 21/07/2026].

---

## ADR-005: Escolha do Banco de Dados Relacional PostgreSQL 16 Self-Hosted

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Persistência relacional com garantia ACID e soberania total dos dados.
- **Decisão:** Adotar **PostgreSQL 16 Self-Hosted** rodando em contêiner Docker.
- **Consequências:** Autonomia total de infraestrutura e zero custo de licença BaaS.
- **Fontes Oficiais:** [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/) [Acesso em 21/07/2026].

---

## ADR-006: Escolha do ORM e Acesso a Dados (Drizzle ORM + PgBouncer)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Mapeamento type-safe sem overhead de binários pesados.
- **Decisão:** Adotar **Drizzle ORM + PgBouncer**.
- **Consequências:** Consultas SQL diretas, previsíveis e pooler de conexões multiplexado.
- **Fontes Oficiais:** [Drizzle ORM Documentation](https://orm.drizzle.team/) [Acesso em 21/07/2026].

---

## ADR-007: Autenticação via Sessões Opacas Server-Side

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Mitigação de vazamentos de tokens e suporte a revogação instantânea de acessos.
- **Decisão:** Adotar **Sessões Opacas Server-Side** com cookies `HttpOnly, Secure, SameSite=Lax`.
- **Consequências:** Zero exposição de tokens em `localStorage` ou cabeçalhos do navegador.
- **Fontes Oficiais:** [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) [Acesso em 21/07/2026].

---

## ADR-008: Fonte de Verdade da Sessão no PostgreSQL com Cache em Redis

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Garantir que o sistema de login não caia caso o Redis fique indisponível.
- **Decisão:** Manter **PostgreSQL como fonte de verdade da sessão** e **Redis como cache acelerador**.
- **Consequências:** Resiliência total de autenticação com fallback para o banco.

---

## ADR-009: Modelo de Autorização Granular RBAC + Ownership

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Garantir que usuários acessem apenas recursos autorizados.
- **Decisão:** Adotar **RBAC Granular com política Deny by Default** e verificações de ownership.

---

## ADR-010: Camada de Cache Unificada com Redis 7

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Aceleração de leitura de dados de KPI e controle de Rate Limiting.
- **Decisão:** Adotar **Redis 7** como camada de cache volátil (não mestre).

---

## ADR-011: Engine de Processamento Assíncrono com BullMQ

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Desacoplamento de tarefas pesadas da API HTTP.
- **Decisão:** Adotar **BullMQ + Redis** em processo de worker dedicado (`apps/worker/`).

---

## ADR-012: Armazenamento de Arquivos Privados em Disk Storage Abstraído

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Armazenamento seguro de PDFs e anexos sem servidores externos no MVP.
- **Decisão:** Adotar **Private Filesystem Volume (`/var/lib/lyvox/storage/`)** com driver abstrato. MinIO mantido como evolução futura.

---

## ADR-013: Servidor Web de Borda e Terminação TLS com Caddy

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Proxy reverso com suporte a renovação automática de certificados SSL/TLS.
- **Decisão:** Adotar **Caddy Server 2**.

---

## ADR-014: Orquestração VPS com Docker Compose v2 e systemd

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Gerenciamento isolado dos contêineres da aplicação em ambiente VPS.
- **Decisão:** Adotar **Docker Compose v2 + systemd**.

---

## ADR-015: Stack de Observabilidade (Pino JSON + Prometheus + Grafana + Loki)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Coleta self-hosted de métricas e agregação de logs.
- **Decisão:** Adotar **Pino JSON, Prometheus, Grafana e Loki** com instrumentação OpenTelemetry.

---

## ADR-016: Estratégia de Backup e Restore Offsite Criptografado

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Proteção contra desastre físico na VPS principal.
- **Decisão:** Adotar **pgBackRest (PostgreSQL) + restic (arquivos)** com destino S3 offsite criptografado AES-256.

---

## ADR-017: Integração com n8n via Transactional Outbox e HMAC

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Comunicação assíncrona e segura com o motor n8n local.
- **Decisão:** Adotar o padrão **Transactional Outbox** no PostgreSQL com validação de assinatura HMAC.

---

## ADR-018: Camada de Inteligência Artificial Local com Ollama

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Copiloto de IA mantendo privacidade de dados sem custos de API externa.
- **Decisão:** Conectar a aplicação ao **Ollama local (Llama 3 / Mistral)** em modo degradado.

---

## ADR-019: Modelo Organizacional de Instância Única (Lyvox Internal System)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Foco no uso interno corporativo da Lyvox no MVP.
- **Decisão:** Adotar **Modelo de Organização Única (`LYVOX`)**. SaaS multi-tenant mantido como evolução.

---

## ADR-020: Resiliência de Processo em VPS Única (Single Point of Failure)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Limitações físicas de hospedagem em uma única VPS.
- **Decisão:** Reconhecer que **uma VPS única não oferece Alta Disponibilidade física**, garantindo RTO de 4h via backups offsite.

---

## ADR-021: Estratégia de Deploy em Janela Controlada

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Publicação previsível de releases sem comprometer a integridade do banco.
- **Decisão:** Adotar **Janela Controlada de Deploy com Backup Prévio Obrigatório**.

---

## ADR-022: Integridade de Pipeline CI/CD com GitHub Actions e GHCR

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Automação de testes, segurança e compilação de imagens imutáveis.
- **Decisão:** Adotar **GitHub Actions + GitHub Container Registry (GHCR)**.
