# 23 — ADRs: Registros de Decisões Arquiteturais (Architectural Decision Records)

- **Documento ID:** DOC-23
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Chief Software Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** Todos os documentos técnicos (DOC-05 a DOC-20)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Michael Nygard ADR Template

---

## ADR-001: Adocao do Estilo Arquitetural Monolito Modular (Modulith)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** O sistema necessita suportar múltiplos módulos empresariais mantendo simplicidade operacional em VPS própria sem a complexidade de rede e orquestração de microsserviços.
- **Opções Avaliadas:** 1. Microsserviços Distribuídos; 2. Monólito Tradicional Não Estruturado; 3. Monólito Modular (Modulith).
- **Critérios:** Latência de comunicação, complexidade de deploy, integridade transacional ACID e facilidade de manutenção.
- **Decisão:** Adotar **Monólito Modular (Modulith)**. O código-fonte é organizado em módulos de domínio estritamente isolados (`src/modules/<modulo>`), comunicando-se via Use Cases ou Eventos de Domínio sem dependências diretas de tabela.
- **Consequências Positivas:** Deploy único em contêiner, transações ACID nativas no PostgreSQL, latência de chamada de método em memória (<1ms) e facilidade de refatoração.
- **Consequências Negativas:** Exige disciplina da equipe para não violar os limites dos módulos.
- **Gatilho de Revisão:** Necessidade de escalar de forma totalmente independente a equipe de desenvolvimento em mais de 5 times isolados.
- **Fontes:** Modular Monolith Architecture (Kamil Grzybek).

---

## ADR-002: Escolha da Stack Frontend (React 18/19 + Vite + TypeScript)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** A interface exige alta reatividade, componentes ricos e excelente performance de carregamento no navegador.
- **Opções Avaliadas:** 1. Next.js (App Router); 2. React + Vite SPA; 3. Vue 3 + Vite.
- **Decisão:** Adotar **React + Vite + TypeScript Single Page Application (SPA)**.
- **Consequências:** Compilação ultra-rápida via esbuild/Vite, total desacoplamento da camada de API Fastify, zero dependência de servidor Node.js para renderização de frontend (arquivos estáticos servidos pelo Caddy).
- **Gatilho de Revisão:** Necessidade crítica de SEO público indexável em páginas dinâmicas (não aplicável ao sistema interno de gestão).

---

## ADR-003: Escolha do Framework Backend (Node.js 20 LTS + Fastify)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** O backend precisa processar requisições HTTP REST com baixíssima latência e consumo eficiente de memória RAM.
- **Opções Avaliadas:** 1. Express.js; 2. NestJS; 3. Fastify; 4. Go (Gin).
- **Decisão:** Adotar **Fastify com TypeScript e Node.js 20 LTS**.
- **Consequências:** Fastify atinge até 30.000 req/sec (menor overhead que Express), possui integração nativa com Zod via Fastify Type Provider e sistema de plugins encapsulation de alta qualidade.
- **Gatilho de Revisão:** Troca de runtime Node.js por Go ou Rust em caso de gargalo computacional extremo em CPU bound operations.

---

## ADR-004: Adocao do Monorepo com pnpm Workspaces e Turborepo

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Necessidade de compartilhar tipos TypeScript, schemas de validação e configurações entre frontend e backend em um único repositório.
- **Opções Avaliadas:** 1. Repositórios Separados (Multi-repo); 2. Monorepo com pnpm Workspaces + Turborepo; 3. Monorepo com Nx.
- **Decisão:** Adotar **pnpm Workspaces + Turborepo**.
- **Consequências:** Reutilização direta de schemas Zod e DTOs, tempo de build reduzido devido ao caching inteligente do Turborepo e instalação ultrarrápida de dependências.

---

## ADR-005: Escolha do Banco de Dados Relacional PostgreSQL 16 Self-Hosted

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Persistência de dados corporativos exigindo integridade ACID, transações complexas, índices avançados e autonomia total (sem BaaS).
- **Opções Avaliadas:** 1. Supabase (BaaS); 2. PostgreSQL 16 Native Self-Hosted; 3. MySQL 8; 4. MongoDB.
- **Decisão:** Adotar **PostgreSQL 16 Self-Hosted** rodando em contêiner Docker com volume em disco NVMe.
- **Consequências:** Zero custo de licença ou dependência de terceiros, controle total sobre tuning, extensões (`pg_trgm`, `uuid-ossp`) e segurança.

---

## ADR-006: Escolha do ORM e Acesso a Dados (Drizzle ORM + PgBouncer)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Mapeamento de dados type-safe com geração de SQL previsível e gerenciamento eficiente de pool de conexões.
- **Opções Avaliadas:** 1. Prisma ORM; 2. Drizzle ORM; 3. Kysely; 4. SQL Cru (pg-node).
- **Decisão:** Adotar **Drizzle ORM + PgBouncer**.
- **Consequências:** O Drizzle possui overhead nulo (não utiliza binário Rust extra como o Prisma), é 100% type-safe e compila para consultas SQL simples e diretas. O PgBouncer garante a multiplexação eficiente de conexões.

---

## ADR-007: Estrutura de Autenticação Própria (Argon2id + JWT + HTTP-Only Cookies)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Garantir autenticação segura de usuários sem o custo operacional e consumo de RAM de um servidor IAM externo.
- **Opções Avaliadas:** 1. Keycloak Server; 2. Auth0 / Supabase Auth; 3. Engine de Autenticação Própria.
- **Decisão:** Adotar **Autenticação Própria** com hash de senha Argon2id, JWT Access Tokens de 15 min e Refresh Tokens em cookies `HttpOnly, Secure, SameSite=Strict`.

---

## ADR-008: Armazenamento de Sessões e Invalidacao via Redis 7

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Necessidade de revogação instantânea de sessões e Refresh Tokens.
- **Opções Avaliadas:** 1. Consulta exclusiva em banco de dados relacional; 2. Redis 7 Memory Store.
- **Decisão:** Adotar **Redis 7** para persistência temporária de sessões e lista negra de tokens revogados.

---

## ADR-009: Modelo de Autorização Granular RBAC com Deny by Default

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Controle rigoroso de acesso a dados por papel de usuário e escopo de empresa/organização.
- **Decisão:** Adotar **RBAC Granular com política Deny by Default**. Qualquer ação que não possua a permissão `recurso:ação` explicitamente atribuída ao papel do usuário é bloqueada.

---

## ADR-010: Camada de Cache Unificada com Redis 7

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Reduzir a carga de leitura no PostgreSQL em consultas repetitivas (Dashboard, KPIs, Listagens).
- **Decisão:** Adotar **Redis 7** como camada oficial de Caching com chaveamento padronizado (`lyvox:<env>:<modulo>:<tenant>:<key>`) e TTLs curtos.

---

## ADR-011: Engine de Processamento Assíncrono com BullMQ

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Processamento de tarefas demoradas (PDFs, e-mails, retries n8n) fora do loop principal do Fastify.
- **Opções Avaliadas:** 1. RabbitMQ; 2. Kafka; 3. BullMQ + Redis.
- **Decisão:** Adotar **BullMQ + Redis**. Aproveita a infraestrutura Redis existente sem adicionar novos serviços de mensageria pesados na VPS.

---

## ADR-012: Armazenamento de Arquivos Privados Abstraído (Storage Driver)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Armazenar documentos e comprovantes com segurança e privacidade total.
- **Decisão:** Adotar **Armazenamento Privado em Volume Local (`/var/lib/lyvox/storage/`)** exposto através de uma interface de driver (`StorageDriver`) desacoplada.

---

## ADR-013: Servidor Web de Borda e Terminação TLS com Caddy

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Proxy reverso com suporte nativo a renovação automática de certificados SSL/TLS Let's Encrypt.
- **Opções Avaliadas:** 1. Nginx + Certbot; 2. Traefik; 3. Caddy Server.
- **Decisão:** Adotar **Caddy Server 2**. Simplifica drasticamente a configuração de certificados HTTPS automáticos e suporte a HTTP/2.

---

## ADR-014: Orquestração de Contêineres com Docker Compose v2 no Host VPS

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Gerenciamento isolado dos contêineres da aplicação em ambiente VPS sob Ubuntu Linux.
- **Opções Avaliadas:** 1. Kubernetes (k3s); 2. HashiCorp Nomad; 3. Docker Compose v2.
- **Decisão:** Adotar **Docker Compose v2 + systemd**.

---

## ADR-015: Stack de Observabilidade Open-Source (Prometheus + Grafana + Loki + OpenTelemetry)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Coleta self-hosted de métricas, traces e agregação de logs JSON.
- **Decisão:** Adotar **Prometheus, Grafana, Loki e OpenTelemetry**.

---

## ADR-016: Estratégia de Backup e Restore Offsite Criptografado

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Garantir a recuperação da base de dados e arquivos em caso de destruição do servidor VPS principal.
- **Decisão:** Utilizar **pgBackRest** para backup contínuo do PostgreSQL (WAL + Full diário) com envio criptografado AES-256 para **Storage Offsite Isolado**.

---

## ADR-017: Integração com n8n via Outbox Pattern e HMAC

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Comunicação segura entre a API principal e o motor local de automações n8n.
- **Decisão:** Adotar o padrão **Transactional Outbox** no PostgreSQL com disparo via worker e validação de assinaturas **HMAC-SHA256**.

---

## ADR-018: Camada de Inteligência Artificial Local com Ollama

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Prover assistente virtual de geração de texto e resumos de reunião mantendo privacidade total de dados.
- **Decisão:** Conectar a aplicação à instância local do **Ollama (Llama 3/Mistral)** com fallback gracioso em modo degradado.

---

## 19. ADR-019: Estratégia Multi-Tenancy Discriminadora (Organization ID)

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Isolamento lógico de dados entre diferentes empresas/organizações no mesmo banco de dados.
- **Opções Avaliadas:** 1. Banco por Tenant; 2. Schema por Tenant; 3. Coluna `organization_id` por Tabela.
- **Decisão:** Adotar **Coluna Discriminadora `organization_id`** em todas as tabelas transacionais com índices compostos.

---

## 20. ADR-020: Resiliência de Processo vs Alta Disponibilidade Física

- **Status:** ACEITO
- **Data:** 2026-07-21
- **Contexto:** Esclarecimento de escopo sobre as limitações operacionais de hospedagem em uma única VPS física.
- **Decisão:** Reconhecer formalmente que **uma VPS única não oferece Alta Disponibilidade (HA) do Host físico**, garantindo resiliência de software (restarts, transações, backups) e RTO de 4 horas.
