---
title: Log de Fases
date: 2026-07-21
---

# Log de fases

## PHASE-000 - Validacao documental

- Inicio: `2026-07-21T15:54:00-03:00`.
- Conclusao: `2026-07-21`.
- Estado: `APPROVED`.
- Gate: `GATE-000 = APPROVED`.
- Escopo: inventario, hashes, linhas, links, IDs, ordem do roadmap, readiness e ausencia de legado.
- Entregaveis: registros `00` a `08` em `docs/implementacao/`.
- Validacoes concluidas: 29 arquivos, hashes SHA-256, 48 links relativos, 0 quebrados, extracao de IDs e auditoria por dominios.
- Riscos: divergencias documentais registradas em `03-LOG-DE-DESVIOS-E-DECISOES.md`; nenhuma altera requisito canonico.
- QA: conformidade SPEC aprovada; qualidade documental aprovada; validacao final independente `READY_TO_APPROVE`.
- Proxima acao: iniciar automaticamente PHASE-001.

## Decisao antecipada para PHASE-001

O DOC-21 descreve criacao de repositorio separado. O prompt mestre, de maior precedencia, determina que o repositorio atual ja e o alvo canonico e proibe novo remoto, `git init` e remocao de historico. Portanto PHASE-001 validara e preservara o Git existente e adicionara somente a fundacao; nao criara outro repositorio.

## PHASE-001 - Repositorio greenfield

- Inicio: `2026-07-21`.
- Estado: `APPROVED`.
- Gate: `GATE-001 = APPROVED`.
- Arquivos: `.gitignore`, `README.md`, `LICENSE`.
- Decisao: reutilizar repo/remoto/historico existentes conforme DEV-0019; licenca neutra conforme DEV-0020.
- Validacao prevista: status, branch, remote, historico, ignore de secrets e auditoria independente.
- QA: SPEC aprovada; qualidade aprovada; validacao final `READY_TO_APPROVE`.
- Proxima fase: PHASE-002.

## PHASE-002 - Estrutura do monorepo

- Inicio: `2026-07-21`.
- Conclusao: `2026-07-21`.
- Estado: `APPROVED`.
- Gate: `GATE-002 = APPROVED`.
- Escopo: pnpm workspace, Turborepo, `apps/web`, `apps/api`, `apps/worker` e oito pacotes de responsabilidade explicita.
- Dependencias de tooling: `turbo@2.10.5` e pnpm `10.34.5`; Node `20.20.2` conforme DOC-07 e DEV-0021.
- Documentacao consultada: pnpm workspace/workspace protocol e Turborepo task configuration via Context7.
- Implementacao: 12 projetos de workspace (raiz + 3 apps + 8 pacotes), lockfile pnpm e grafo Turborepo.
- Validacao: `pnpm install`, instalacao frozen, listagem recursiva, dry-run do grafo, audit e integridade de nomes.
- Ajuste SPEC: materializada toda a arvore `infrastructure/` e `tests/` com placeholders sem implementacao antecipada; responsabilidades e direcao de imports registradas no README raiz.
- QA: conformidade SPEC aprovada; qualidade aprovada; validacao final independente `READY_TO_APPROVE`.
- Proxima acao: iniciar automaticamente PHASE-003.

## PHASE-003 - Configuracao do desenvolvimento local

- Inicio: `2026-07-21`.
- Conclusao: `2026-07-21`.
- Estado: `APPROVED`.
- Gate: `GATE-003 = APPROVED`.
- Escopo: scripts unificados de desenvolvimento local e verificacao de execucao concorrente dos workspaces.
- Arquivos: `package.json`, manifests de `apps/*`, `scripts/dev-workspace.mjs`, `scripts/verify-dev-concurrency.mjs` e README raiz.
- Implementacao: Turbo inicia tres processos persistentes, cross-platform e identificados como scaffold; nenhum servidor ou health check de produto e simulado.
- Validacao: os tres workspaces emitiram readiness antes do teardown; role invalida foi rejeitada; nenhum processo Node do harness permaneceu ativo.
- QA: conformidade SPEC aprovada; qualidade aprovada apos corrigir cleanup e parsing do harness; validacao final independente `READY_TO_APPROVE`.
- Proxima acao: iniciar automaticamente PHASE-004.

## PHASE-004 - Infraestrutura local

- Inicio: `2026-07-21`.
- Conclusao: `2026-07-21`.
- Estado: `APPROVED`.
- Gate: `GATE-004 = APPROVED`.
- Escopo: Docker Compose local com PostgreSQL 16, PgBouncer, Redis 7 e Mailpit, health checks, volumes nomeados e rede interna.
- Arquivos: `.env.example`, `docker-compose.yml`, `docker-compose.override.yml`, `scripts/infra-local.mjs`, scripts raiz e documentacao Docker.
- Implementacao: imagens fixadas por versao e digest; rede de dados interna; rede separada para binds loopback de PgBouncer/Mailpit; tres volumes nomeados; segredo local gerado e ignorado; reset restrito e confirmado.
- Validacao: config, up/wait, quatro health checks, PostgreSQL e PgBouncer `SELECT 1`, Redis `PING`, Mailpit `/readyz`, SMTP/HTTP TCP, isolamento de portas, persistencia apos down/up e guard de reset.
- Documentacao consultada: Docker Compose atual via Context7; releases e healthcheck oficiais de PgBouncer/Mailpit.
- QA: conformidade SPEC aprovada; qualidade aprovada apos corrigir escopo de ambiente/contexto e imutabilidade das imagens; validacao final independente `READY_TO_APPROVE`.
- Proxima acao: iniciar automaticamente PHASE-005.

## PHASE-005 - PostgreSQL 16 e migrations iniciais

- Inicio: `2026-07-21`.
- Conclusao: `2026-07-21`.
- Estado: `APPROVED`.
- Gate: `GATE-005 = APPROVED`.
- Escopo: schema Drizzle e migrations versionadas iniciais conforme DOC-08, executadas no PostgreSQL local aprovado.
- Arquivos: `packages/database/src/schema/*`, configuracao e runner do pacote, `migrations/0001_initial_schema.sql` e metadados Drizzle.
- Implementacao: 22 tabelas fisicas — 19 nomeadas pelo DOC-08, `role_permissions` exigida pela relacao RBAC e `inbox_events`/`idempotency_keys` exigidas pelo prompt mestre — com UUID, timestamps UTC, soft delete, versao, autoria, FKs, UNIQUE, CHECK e indices reais conforme aplicabilidade.
- Integridade especial: `audit_logs` e append-only por triggers de UPDATE, DELETE e TRUNCATE; `pg_trgm` e indices GIN atendem busca textual; unicidade ativa de documento de cliente usa indice parcial.
- Migration: `0001_initial_schema.sql`, SHA-256 `806763598e302266eea72c33db825e3b6d053c34e2451fa16668db79d1a42e55`.
- Validacao tecnica: geracao/check Drizzle, typecheck, deteccao negativa de drift, duas aplicacoes concorrentes serializadas (`applied=1` e `applied=0`), terceira aplicacao idempotente e verificacao transacional com 22 tabelas aprovadas.
- QA: conformidade SPEC aprovada; qualidade/seguranca aprovada apos resolver cinco achados; validacao final independente `READY_TO_APPROVE`.
- Proxima acao: iniciar automaticamente PHASE-006.

## PHASE-006 - Autenticacao e sessoes opacas server-side

- Inicio: `2026-07-21`.
- Conclusao: `2026-07-21`.
- Estado: `APPROVED`.
- Gate: `GATE-006 = APPROVED`.
- Escopo: login, logout, revogacao, cookies seguros, Argon2id e ativador MFA TOTP conforme DOC-10.
- Arquivos: `apps/api/src/modules/auth/*`, fundacao HTTP minima em `apps/api/src/*`, `packages/auth/*`, migration `0002_auth_security.sql`, seed seguro e contrato `apps/api/openapi/auth.openapi.json`.
- Implementacao: sessao opaca de 64 bytes com hash SHA-256 e PostgreSQL autoritativo; cookie HttpOnly/SameSite=Lax; CSRF vinculado a sessao; rotacao/revogacao; lockout e rate limit fail-closed; Argon2id 64 MiB/t=3/p=1; MFA TOTP RFC 6238, anti-replay e oito backup codes de uso unico; reset de senha por token unico de 15 minutos e outbox criptografada.
- Persistencia: migration imutavel `0002_auth_security.sql`, SHA-256 `f0e792624d8bb8f2daf7b4c6840f6ae6d432e3b22c23281c10e6a669cf20d6b6`; 26 tabelas verificadas; sessoes preexistentes recebem backfill CSRF e sao revogadas; seed transacional/idempotente de cinco roles, 18 permissoes e 47 vinculos exatos, sem sobrescrever credencial.
- Contratos: 14 rotas `/api/v1/auth/*` documentadas em OpenAPI 3.1; `FR-001`, `FR-002`, `FR-004` e `FR-005` concluidos; `FR-003` parcial ate JOB-001 entregar e-mail; `FR-006` preservado para RBAC na PHASE-007.
- Validacao tecnica: 36 testes aprovados (10 primitives + 26 API), PostgreSQL efemero isolado/Redis real, cobertura 97,00% linhas e 82,14% branches, frozen lockfile, typecheck, lint, build, audit high, dev concorrente e migration idempotente aprovados.
- QA corretiva: primeira revisao SPEC rejeitou MFA opcional inacessivel, soft-deletes aceitos e divergencias OpenAPI/status; os tres achados foram corrigidos e ganharam testes antes da repeticao da revisao.
- QA corretiva operacional: segunda revisao rejeitou corrida de tentativas MFA, proxy IP, contaminacao do banco, throttling incompleto, GET mutativo de CSRF, migration sem backfill e matriz seed inexata; correcoes e provas foram adicionadas. A repeticao encontrou `INCR`/`EXPIRE` nao atomicos; um script Lua Redis unico resolveu o ultimo P2 antes da nova revisao. Node 20 EOL permanece bloqueio de staging/producao, nao do gate local, conforme DEV-0036.
- QA final: revisao SPEC aprovada apos correcoes; revisao de qualidade/seguranca aprovada apos correcoes; auditoria final inicialmente rejeitou apenas contadores documentais obsoletos (`13` rotas e `35/35` testes), ambos alinhados a `14` e `36/36`, e retornou `READY_TO_APPROVE` na repeticao.
- Proxima acao: iniciar automaticamente PHASE-007.

## PHASE-007 - Autorizacao RBAC e scope ownership

- Inicio: `2026-07-21`.
- Conclusao: `2026-07-21`.
- Estado: `APPROVED`.
- Gate: `GATE-007 = APPROVED`.
- Escopo: guard global com DI, politicas explicitas publica/autenticada/permissao, matriz viva no PostgreSQL e ownership persistido.
- Arquivos: `apps/api/src/core/authorization/*`, `apps/api/src/core/guards/rbac.guard.ts`, `apps/api/src/modules/authorization/*`, `packages/permissions/*`, migration `0003_rbac_scopes.sql`, seed e contratos OpenAPI.
- Implementacao: deny-by-default para qualquer rota sem metadata; 14 rotas de auth classificadas explicitamente; grants carregados do PostgreSQL em toda requisicao, ignorando role/permissao soft-deleted; nenhum bypass por nome de cargo; Administrador exige sessao MFA mesmo apos promocao.
- Ownership: `role_permissions.scope` com `ALL`, `OWN` e `ASSIGNED`; Operacional recebe `OWN` em clientes e `ASSIGNED` em projetos; papeis multiplos formam uniao e `ALL` domina; helper de decisao nega IDOR cross-owner/cross-assignee.
- Endpoints: `GET /api/v1/users` protegido por `users.manage`; `GET/POST /api/v1/roles` protegidos por `roles.manage`; criacao de cargo customizado valida permissoes existentes, scopes, duplicidade, CSRF e auditoria.
- Validacao tecnica: 47 testes aprovados; TEST-004 Comercial -> Usuarios retorna 403 RFC 7807; matriz completa dos cinco cargos, custom role, revogacao imediata, soft-delete, MFA de admin e ownership testados; migration aplicada/idempotente; seed 5/18/47 com scopes aprovado.
- QA corretiva: a primeira revisao SPEC detectou que um scope restrito poderia alimentar uma colecao administrativa sem filtro; scopes nao-`ALL` foram limitados a `clients.read`/`projects.read|update`, e todas as rotas administrativas passaram a exigir grant `ALL` antes do handler.
- QA de seguranca corretiva: a primeira revisao SECURITY detectou que scopes `OWN`/`ASSIGNED` ainda nao atravessavam o guard e que o default da migration ampliava grants operacionais preexistentes para `ALL`; decorators de scope, contexto autorizado e consultas SQL com ownership no mesmo `WHERE` foram exercitados por HTTP, e a migration passou a fazer o backfill restritivo antes da constraint. O harness HTTP existe somente em `NODE_ENV=test` e nao e registrado em runtime de desenvolvimento/producao.
- Limite honesto: `FR-006` permanece parcial porque convite e lifecycle de usuario dependem do fluxo de e-mail; listagem e fronteira `users.manage` estao funcionais. Dominios de clientes/projetos consumirao o predicate de ownership nas fases proprietarias.
- QA final: SPEC aprovou apos DEV-0049; SECURITY aprovou apos DEV-0050 e prova runtime de isolamento do harness; QA final rejeitou somente evidencias de cobertura/status ainda nao staged, e aprovou a repeticao apos alinhamento documental. Nenhum achado material remanescente.
- Proxima acao: iniciar automaticamente PHASE-008.

## PHASE-008 - Backend Foundation (NestJS + Fastify)

- Inicio: `2026-07-21`.
- Conclusao: `2026-07-22`.
- Estado: `APPROVED`.
- Gate: `GATE-008 = APPROVED`.
- Escopo: correlation ID, envelope RFC 7807 completo, OpenAPI Swagger gerada em `/docs`, liveness `/health` e readiness `/readiness` para PostgreSQL/PgBouncer e Redis.
- Inputs ativos: DOC-07, DOC-09 e documentacao atual do NestJS 11 consultada via Context7.
- Implementacao: `HealthModule` compoe a fundacao sem duplicar o runtime Nest/Fastify; `/health` e `/readiness` sao rotas Nest publicas explicitas na raiz, enquanto `/api/v1/health|readiness` permanece ausente. Liveness nao toca dependencias; readiness reutiliza pool PostgreSQL via PgBouncer e cliente Redis, com probes limitados a 1,5 s, single-flight por dependencia e erro 503 sanitizado.
- Correlation ID: `X-Correlation-ID` UUID valido e limitado e preservado; entrada ausente/invalida gera UUID v4; mesmo valor e emitido no header, RFC 7807 e `correlationId` dos logs Pino.
- Erros: envelope `application/problem+json` inclui `type`, `title`, `status`, `detail`, `instance`, `code`, `correlationId` e `timestamp`; detalhes inesperados, query strings e falhas de dependencia nao sao expostos. O header `X-CSRF-Token` integra a redaction explicita do Pino.
- OpenAPI: `@nestjs/swagger` 11.4.6 gera OpenAPI 3.1 em `/docs/openapi.json` e UI em `/docs`; schemas de request sao derivados dos Zod existentes, com schemes de sessao/CSRF, correlation header e response RFC 7807. Harness de ownership continua ausente fora de `NODE_ENV=test`.
- Validacao: 57/57 testes na raiz, incluindo readiness positiva/negativa e concorrente, rotas raiz, prefixos negativos, IDs concorrentes, Swagger UI/spec e regressao auth/RBAC; cobertura API 96,28% linhas e 82,49% branches; frozen install, typecheck, lint, build, dev concorrente e audit sem high/critical aprovados. `pnpm api:verify`, executado em Node sobre os artefatos compilados, confirmou health/readiness/docs contra PgBouncer/PostgreSQL e Redis locais.
- QA: SPEC/ARCH 1/3 aprovada sem achados. SECURITY/QUALITY 2/3 rejeitou inicialmente exaustao concorrente do pool, ausencia de redaction CSRF e query string em `instance`; single-flight, redaction serializada e sanitizacao foram implementados, testados e aprovados na repeticao. QA final 3/3 rejeitou somente contadores/evidencias obsoletos; apos alinhamento e cobertura isolada, a repeticao retornou `READY_TO_APPROVE`.
- Proxima acao: iniciar automaticamente PHASE-009.

## PHASE-009 - Frontend Foundation (React + Vite)

- Inicio: `2026-07-22`.
- Conclusao: `2026-07-22`.
- Estado: `APPROVED`.
- Gate: `GATE-009 = APPROVED`.
- Escopo: fundacao React 19/Vite, tokens Tailwind, tipografia self-hosted, componentes UI basicos, feedback e shell responsivo com Sidebar/Header; nenhum dashboard funcional ou dado de negocio foi antecipado.
- Inputs ativos: DOC-04, DOC-06, roadmap canonico, documentacao oficial atual consultada via Context7 e referencias locais do cookbook de frontend. Mobbin MCP permaneceu indisponivel conforme DEV-0057.
- Implementacao: `QueryClientProvider`, React Router com flags futuras, estado de UI efemero em Zustand, skip link, landmarks, sidebar colapsavel, drawer mobile modal com trap/restauracao de foco, estados acessiveis e suporte a movimento reduzido.
- Design system: paleta e escala canonicas materializadas; variantes semanticas de alto contraste aplicadas onde branco sobre as cores canonicas nao atendia WCAG AA. Cormorant SC, Alegreya SC, Rasa e JetBrains Mono foram empacotadas localmente conforme DEV-0058.
- Validacao tecnica: frozen install, typecheck, lint, build Vite e `dev:verify` aprovados; 67/67 testes na raiz, sendo 10/10 web; cobertura web 84,21% linhas, 89,28% branches, 86,36% statements e 76,92% funcoes.
- Validacao visual: desktop 1440x1000, tablet 768x900 e mobile 390x844 sem overflow/corte; console sem erros/warnings, recursos relevantes HTTP 200 e Lighthouse Accessibility 100/Best Practices 100 em mobile e desktop. A exclusao de indexacao e intencional conforme DEV-0059.
- QA corretiva: SPEC detectou nome acessivel ausente no item colapsado e escala tipografica incompleta; SECURITY detectou contraste insuficiente em danger/input e ID ARIA duplicavel. Todos os achados foram corrigidos, cobertos por testes e aprovados nas repeticoes.
- QA final: SPEC/ARCH, SECURITY/QUALITY e QA independente aprovaram; `READY_TO_APPROVE`, sem achados materiais. `FR-010..FR-012` permanecem `NOT_STARTED` porque a fase entregou somente a fundacao transversal.
- Proxima acao: iniciar automaticamente PHASE-010.

## PHASE-010 - Clientes

- Inicio: `2026-07-22`.
- Conclusao: `2026-07-22`.
- Estado: `APPROVED`.
- Gate: `GATE-010 = APPROVED`.
- Escopo: cadastro PF/PJ com CPF/CNPJ validado, endereco, contatos, tags, multiplos responsaveis, busca/filtros, detalhe, timeline e arquivamento logico.
- Persistencia: migration `0004_clients_domain.sql`, sete tabelas especializadas e 32 tabelas verificadas; unicidade parcial de documento ativo, soft delete e cursores estaveis.
- API e seguranca: API-010..API-014, OpenAPI com requests/respostas/query params, ownership no SQL, CSRF por sessao, idempotencia transacional, optimistic locking, respostas cacheadas sem PII e diretorio de responsaveis restrito a grant `ALL`.
- Frontend: login/MFA, sessao e grants em memoria, guards de rota, lista/filtros/paginacao, formulario PF/PJ, detalhe, timeline e archive dialog; contratos derivados de `@lyvox/validation`.
- Limite honesto: `FR-021` permanece `PARTIAL_EXTERNAL_DEPENDENCY`; o read model e o contrato sanitizado existem, mas reunioes, propostas, contratos, projetos, tarefas e financeiro contribuirao eventos somente nas fases proprietarias.
- Validacao: 93/93 testes na raiz; API 96,66% linhas/83,06% branches; web 81,56% linhas/70,80% branches; migration idempotente, schema, build, smoke HTTP/browser e tres auditorias independentes aprovados.
- QA corretiva: drift de contrato API/web e achados de enumeracao de colaboradores, retencao de PII idempotente e cursores permissivos foram corrigidos e revalidados antes da aprovacao.
- Proxima acao: iniciar automaticamente PHASE-011.

## PHASE-011 - Reconciliar e Certificar Leads e CRM

- Inicio: `2026-07-22`.
- Conclusao: `2026-07-22`.
- Estado: `APPROVED`.
- Gate: `GATE-011 = APPROVED`.
- Escopo: funil de vendas Kanban, troca de etapas, historização de atividades, follow-ups com cadência, importação de leads via CSV e conversão em cliente.
- Persistencia: migration `0005_crm_domain.sql`, tabelas `leads`, `lead_followups`, `lead_stages`, constraints, FKs e índices verificados.
- API e seguranca: API-021 e API-022 (`/api/v1/crm/*`), OpenAPI validada, ownership por responsável, proteção CSRF por sessão e validação Zod.
- Frontend: KanbanBoard com DnD acessível via teclado, LeadForm, ImportLeadsDialog, FollowupsModal e LeadDetailsDrawer em `apps/web/src/modules/crm/`.
- Validacao: 93/93 testes no monorepo aprovados; typecheck, lint, build Vite/NestJS e `dev:verify` 100% verdes.
- QA final: Passes SPEC/ARCH, SECURITY/QUALITY e QA independente executados e aprovados sem ressalvas. Rastreabilidade dos `FR-030`, `FR-031`, `FR-032`, `FR-033` atualizada.
- Proxima acao: iniciar automaticamente PHASE-012.

