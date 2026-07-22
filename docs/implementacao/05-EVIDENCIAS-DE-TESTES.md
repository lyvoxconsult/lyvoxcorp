---
title: Evidencias de Testes
date: 2026-07-21
phase: PHASE-000
---

# Evidencias de testes

## PHASE-000

| Data | Comando/checagem | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| 2026-07-21 | Inventario `docs/planejamento/*.md` | Windows PowerShell | PASS | 29 arquivos, 169342 bytes, 2927 linhas |
| 2026-07-21 | SHA-256 por documento | Windows PowerShell | PASS | 29 hashes registrados no manifesto |
| 2026-07-21 | Validacao de links Markdown relativos | Windows PowerShell | PASS | 48 links avaliados, 0 quebrados |
| 2026-07-21 | Extracao regex de IDs canonicos | Windows PowerShell | PASS | 56 FR, 20 BR, 26 API, 19 DB, 10 TEST, 31 PHASE e 31 GATE unicos |
| 2026-07-21 | `git status`, branch, remote e log | Git 2.53.0 | PASS_WITH_PREEXISTING_CHANGES | Estado inicial preservado em arquivo dedicado |
| 2026-07-21 | Auditoria humana por blocos DOC-00..DOC-28 | Multiagente, somente leitura | PASS_WITH_FINDINGS | 29/29 lidos; achados DEV-0001..DEV-0019 registrados; revisoes subsequentes abaixo |
| 2026-07-21 | Revisao independente de conformidade SPEC | Subagente QA, somente leitura | PASS | PHASE-000 atende prompt mestre apos DEV-0019 |
| 2026-07-21 | Revisao independente de qualidade documental | Subagente QA, somente leitura | PASS | Evidencia honesta, consistente e sem secrets |
| 2026-07-21 | Validacao final independente | Subagente auditor, somente leitura | PASS | `READY_TO_APPROVE`; nenhum HARD_BLOCKER atual |

Nenhum teste de codigo, banco, API ou browser se aplica antes do bootstrap. Nenhum resultado foi simulado.

## PHASE-001

| Data | Comando/checagem | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| 2026-07-21 | `git status`, branch, remote e log | Git 2.53.0 | PASS_WITH_PREEXISTING_CHANGES | Branch `feature/greenfield-foundation`, origin canonico e historico preservado |
| 2026-07-21 | `git check-ignore --no-index -v` | Git 2.53.0 | PASS | Runtime raiz, `.env*`, dependencias, outputs e secrets ignorados; paths de codigo homonimos, `.env.example`, `.vscode` permitidos, README, LICENSE e docs preservados |
| 2026-07-21 | `git diff --cached --check` apos staging por pathspec | Git 2.53.0 | PASS | Todos os 8 arquivos criados/alterados da fase cobertos; nenhum erro de whitespace |
| 2026-07-21 | `git fsck --connectivity-only` | Git 2.53.0 | PASS_WITH_DANGLING_STASH_OBJECTS | Conectividade valida; objetos dangling sao stashes temporarios ja restaurados/removidos |
| 2026-07-21 | Varredura de atribuicoes de credenciais | PowerShell/rg | PASS | Nenhum segredo literal nos arquivos da fase |
| 2026-07-21 | Revisao SPEC, qualidade e validacao final | Tres revisores independentes, somente leitura | PASS | `READY_TO_APPROVE`; nenhum HARD_BLOCKER atual |

## PHASE-002

| Data | Comando/checagem | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| 2026-07-21 | `pnpm install` | pnpm 11.9.0 / Node 24.14.0 | DISCOVERY_ONLY | Estrutura reconhecida, mas runtime divergiu do Node 20 canonico; resultado substituido por DEV-0021 |
| 2026-07-21 | `pnpm install --frozen-lockfile` | pnpm 11.9.0 / Node 24.14.0 | DISCOVERY_ONLY | Nao usado para o gate por incompatibilidade de runtime |
| 2026-07-21 | `pnpm list --depth -1 -r` | pnpm 11.9.0 | PASS | Raiz, 3 apps e 8 pacotes privados listados |
| 2026-07-21 | `pnpm exec turbo --version` e dry-run do build | Turborepo 2.10.5 | PASS | Monorepo reconhecido; 11 pacotes no grafo; scripts de app ainda inexistentes por fase |
| 2026-07-21 | `pnpm audit --audit-level high` | Registry npm | PASS | Nenhuma vulnerabilidade conhecida |
| 2026-07-21 | Parse de manifestos e unicidade | PowerShell | PASS | 11 manifestos; 11 nomes unicos |
| 2026-07-21 | `pnpm build`, `lint`, `typecheck`, `test` | Turborepo 2.10.5 | PASS_WITH_NO_TASKS | Orquestracao raiz valida; zero tarefas executadas porque implementacoes iniciam na PHASE-003; nao conta como teste de produto |
| 2026-07-21 | Inventario da estrutura exigida | PowerShell | PASS | 11/11 READMEs de placeholder em `infrastructure/` e `tests/`; nenhuma implementacao futura antecipada |
| 2026-07-21 | Auditoria de arestas internas | PowerShell | PASS | Zero dependencia interna atual; contrato de imports e responsabilidades documentado; nenhum ciclo possivel no estado inicial |
| 2026-07-21 | SHA-256 do runtime Node oficial | Node.js release archive | PASS | `node-v20.20.2-win-x64.zip` = `DC3700FDD57A63EEDB8FD7E3C7BAAA32E6A740A1B904167FF4204BC68ED8BF77` |
| 2026-07-21 | `pnpm install` + frozen install | Node 20.20.2 / pnpm 10.34.5 | PASS | 12 workspaces; lockfile reproduzivel; `turbo@2.10.5` instalado |
| 2026-07-21 | Workspace list, Turbo dry-run e audit | Node 20.20.2 / pnpm 10.34.5 | PASS | 11 pacotes no grafo, monorepo reconhecido e nenhuma vulnerabilidade conhecida |
| 2026-07-21 | Teste negativo de runtime | Node 24.14.0 | PASS | Install rejeitado com `ERR_PNPM_UNSUPPORTED_ENGINE`; enforcement Node 20 comprovado |
| 2026-07-21 | Revisao SPEC, qualidade e validacao final | Tres revisores independentes, somente leitura | PASS | `READY_TO_APPROVE`; 26/26 caminhos, 11 nomes unicos, zero ciclo, 0 vulnerabilidades conhecidas e nenhum `HARD_BLOCKER` |

## PHASE-003

| Data | Comando/checagem | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| 2026-07-21 | Primeira execucao de `pnpm dev:verify` | Node 20.20.2; Corepack raiz; pnpm global 11 nos filhos | FAIL_RESOLVED | Turbo iniciou os tres jobs, mas o pnpm global incompativel falhou; causa e resolucao registradas em DEV-0022 |
| 2026-07-21 | `pnpm install --frozen-lockfile` | Node 20.20.2 / pnpm 10.34.5 | PASS | 12 workspaces; lockfile permaneceu imutavel |
| 2026-07-21 | `pnpm dev:verify` | Node 20.20.2 / pnpm 10.34.5 / Turbo 2.10.5 | PASS | `LYVOX_DEV_CONCURRENCY_OK workspaces=api,web,worker`; harness encerrou a arvore apos readiness dos tres processos |
| 2026-07-21 | Turbo dry-run de `dev` | Node 20.20.2 / Turbo 2.10.5 | PASS | Tres tarefas persistentes de app presentes no grafo; concorrencia raiz configurada em 4 conforme requisito do Turbo |
| 2026-07-21 | Role invalida em `dev-workspace.mjs` | Node 20.20.2 | PASS | Entrada fora da allowlist rejeitada com exit code 1 |
| 2026-07-21 | Busca de processo Node com `dev-workspace.mjs` apos QA | WMI/PowerShell | PASS | Nenhum processo do harness permaneceu ativo |
| 2026-07-21 | Revisao SPEC, qualidade e validacao final | Tres revisores independentes, somente leitura | PASS | `READY_TO_APPROVE`; cleanup/parsing revisados, zero secret, zero overreach e nenhum `HARD_BLOCKER` |

Esta validacao prova apenas o ambiente de desenvolvimento concorrente da PHASE-003; nao declara web, API, worker, portas ou health checks funcionais.

## PHASE-004

| Data | Comando/checagem | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| 2026-07-21 | `pnpm infra:config` e `docker compose ... config --quiet` | Docker Compose 5.2.0 | PASS | Quatro servicos e dois manifests validos; imagens sem tag `latest` |
| 2026-07-21 | Bootstrap de `.env` | Node 20.20.2 | PASS | Senha aleatoria gerada sem exibicao; `.env` ignorado e ausente de `git ls-files`; placeholder apenas em `.env.example` |
| 2026-07-21 | Primeira/segunda execucoes `infra:up` | Docker Desktop 4.81.0 / Engine 29.6.1 | FAIL_RESOLVED | Quatro containers ficaram healthy; validadores expuseram corpo vazio de `/readyz`, merge de override e bind inativo em rede somente internal; DEV-0023 registra correcoes |
| 2026-07-21 | `pnpm infra:up` e `pnpm infra:health` finais | Docker Compose 5.2.0 | PASS | `LYVOX_INFRA_HEALTH_OK services=postgres,pgbouncer,redis,mailpit` em duas execucoes consecutivas |
| 2026-07-21 | Consultas de dependencia | Containers locais | PASS | PostgreSQL `pg_isready` + `SELECT 1`; PgBouncer `SELECT 1`; Redis `PONG`; Mailpit `/readyz` HTTP 200 |
| 2026-07-21 | Rede, portas, volumes e TCP | Docker inspect + Node net | PASS | Rede de dados `Internal=true`; PostgreSQL/Redis sem bind; PgBouncer 6432 e Mailpit 1025/8025 apenas `127.0.0.1`; tres volumes nomeados; tres portas acessiveis |
| 2026-07-21 | `infra:down` seguido de inspect e `infra:up` | Docker Compose 5.2.0 | PASS | Zero container orfao; volumes preservados; quatro servicos voltaram healthy |
| 2026-07-21 | `pnpm infra:reset` sem confirmacao | Development | PASS | Operacao destrutiva recusada; nenhuma remocao de volume executada |
| 2026-07-21 | Versoes e IDs locais | Docker Engine 29.6.1 | PASS | PostgreSQL 16.14 `786dab...`; PgBouncer 1.25.2 `7d7a27...`; Redis 7.4.9 `6ab0b6...`; Mailpit 1.30.5 `b868af...` |
| 2026-07-21 | Variaveis host conflitantes | Node 20.20.2 / Compose 5.2.0 | PASS | `COMPOSE_PROJECT_NAME` e senha curtos no shell nao sobrepuseram o `.env` validado; config permaneceu no projeto local |
| 2026-07-21 | Endpoint Docker remoto simulado | `DOCKER_HOST=tcp://example.invalid:2375` | PASS | Comando recusado antes de chamar Compose; somente endpoints locais `npipe`/`unix` sao aceitos |
| 2026-07-21 | Reexecucao com imagens imutaveis | Docker Compose 5.2.0 | PASS | Quatro referencias `tag@sha256`, quatro containers healthy e `infra:health` aprovado novamente |
| 2026-07-21 | Revisao SPEC, qualidade e validacao final | Tres revisores independentes, somente leitura | PASS | `READY_TO_APPROVE`; zero secret, zero endpoint remoto, digests imutaveis e nenhum `HARD_BLOCKER` |

O gate comprova apenas a infraestrutura de suporte local. Nenhuma aplicacao, migration, seed, schema ou prontidao de produto foi declarada.

## PHASE-005

| Data | Comando/checagem | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| 2026-07-21 | Consulta de documentacao Drizzle atual | Context7, documentacao oficial | PASS | Padroes atuais de schema PostgreSQL, constraints, indices e migrations confirmados antes da implementacao |
| 2026-07-21 | `pnpm install` e `pnpm install --frozen-lockfile` | Node 20.20.2 / pnpm 10.34.5 | PASS | 36 pacotes adicionados; lockfile reproduzivel |
| 2026-07-21 | `pnpm --filter @lyvox/database db:generate` | Drizzle Kit 0.31.10 | PASS | Snapshot e SQL inicial gerados para 22 tabelas; migration final nomeada `0001_initial_schema.sql` |
| 2026-07-21 | Recriacao controlada do schema local pre-gate | PostgreSQL 16.14 local, banco novo da implementacao | PASS | Somente schemas `drizzle` e `public` da fase removidos e recriados antes da aplicacao final; nenhum dado persistente de usuario existia |
| 2026-07-21 | Teste negativo de drift em migration aplicada | PgBouncer local / PostgreSQL 16.14 | PASS | Alteracao pre-gate foi recusada com `Applied migration drift detected at position 1`; conexao encerrada e estado preservado |
| 2026-07-21 | Duas execucoes concorrentes `pnpm db:migrate` em banco local limpo | PgBouncer local / PostgreSQL 16.14 | PASS | Advisory transaction lock serializou execucoes: uma retornou `applied=1`, outra `applied=0`, ambas com SHA-256 `806763598e302266eea72c33db825e3b6d053c34e2451fa16668db79d1a42e55` |
| 2026-07-21 | Terceira execucao `pnpm db:migrate` | PgBouncer local / PostgreSQL 16.14 | PASS | `LYVOX_DB_MIGRATE_OK applied=0 total=1`; idempotencia e hash remoto/local comprovados |
| 2026-07-21 | `pnpm db:verify` | PgBouncer local / PostgreSQL 16.14 | PASS | `LYVOX_DB_VERIFY_OK tables=22`; tabelas, `pg_trgm`, indices, UTC e colunas-base verificados |
| 2026-07-21 | Testes negativos transacionais de constraints | PostgreSQL 16.14 | PASS | UNIQUE de email/documento ativo, CHECK de status/tipo/valor, FK de sessao, defaults de outbox e append-only contra UPDATE/DELETE/TRUNCATE rejeitaram/aceitaram conforme contrato; transacao revertida |
| 2026-07-21 | `pnpm --filter @lyvox/database db:check` | Drizzle Kit 0.31.10 | PASS | `Everything's fine`; journal e snapshot consistentes |
| 2026-07-21 | `pnpm typecheck` | Node 20.20.2 / TypeScript 7.0.2 / `@types/node` 20.19.30 | PASS | Pacote `@lyvox/database` compilado sem emissao e sem permitir APIs exclusivas de Node posterior |
| 2026-07-21 | `pnpm audit --audit-level high` | Registry npm | PASS_WITH_MODERATE_FINDING | 0 high/critical; 1 moderada transitiva no esbuild de tooling, registrada em DEV-0028 |
| 2026-07-21 | Revisao sequencial SPEC, qualidade/seguranca e validacao final | Tres revisores independentes, somente leitura | PASS | SPEC aprovada; cinco achados operacionais corrigidos e revalidados; `READY_TO_APPROVE`, 20 arquivos staged e nenhum `HARD_BLOCKER` |

Nenhum seed, endpoint ou comportamento funcional foi declarado nesta fase. Os dados temporarios dos testes foram executados dentro de transacao e revertidos.

## PHASE-006

| Data | Comando/checagem | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| 2026-07-21 | `pnpm --filter @lyvox/auth test` | Node 20.20.2 / Vitest 4.1.10 | PASS | 10/10 testes: Argon2id, politica de senha, tokens, CSRF, TOTP/anti-replay, AES-GCM, backup codes e cookies |
| 2026-07-21 | `pnpm --filter @lyvox/api test` | NestJS/Fastify + PostgreSQL 16 efemero/Redis local | PASS | 26/26 testes; oito cenarios isolados cobrem login, lockout, rotacao/CSRF, sessoes, MFA e concorrencia, reset/throttling, soft-delete, migration legada e fallback Redis |
| 2026-07-21 | `vitest run --coverage` | V8 coverage | PASS | 97,00% linhas, 82,14% branches, 96,73% funcoes e 94,51% statements; thresholds de 80% ativos |
| 2026-07-21 | OpenAPI contract test | OpenAPI 3.1 JSON | PASS | As 14 rotas implementadas correspondem exatamente aos path items documentados |
| 2026-07-21 | Seed apply duas vezes + verify | PostgreSQL 16 via PgBouncer | PASS | 5 roles, 18 permissoes e 47 vinculos; primeira criou admin/credencial, segunda preservou senha; MFA pending |
| 2026-07-21 | Seed com permissao extra e segundo e-mail administrativo | PostgreSQL 16 via PgBouncer | PASS | Reexecucao removeu o 48o vinculo nao canonico e restaurou matriz exata de 47; tentativa de criar segundo bootstrap admin foi recusada |
| 2026-07-21 | `pnpm dev:verify` | Turbo + processo Nest/Fastify real | FAIL_RESOLVED | DI implicita falhou no `tsx watch`; `@Inject(AuthService)` resolveu e execucao final confirmou api, web e worker |
| 2026-07-21 | `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test` | Node 20.20.2 / pnpm 10.34.5 | PASS | Lock reproduzivel; 3 typechecks, lint zero erro, build e suite final com 36/36 testes aprovados (10 primitives + 26 API) apos a QA corretiva |
| 2026-07-21 | Revisao SPEC 1/3 inicial | Diff staged | FAIL_RESOLVED | MFA opcional inacessivel, tres consultas sem soft-delete e OpenAPI/status divergentes foram corrigidos; novos testes negativos e rota de enrollment aprovados |
| 2026-07-21 | Revisao qualidade/seguranca 2/3 inicial | Diff staged | FAIL_RESOLVED | Sete achados tecnicos corrigidos: tentativa MFA atomica, proxy CIDR explicito, banco de teste efemero, throttling sensivel, CSRF POST/no-store, backfill da migration e matriz seed exata; Node EOL mantido como bloqueio de deploy |
| 2026-07-21 | Revisao qualidade/seguranca 2/3 repetida | Diff staged | FAIL_RESOLVED | Ultimo P2 corrigido: contador e TTL do rate limit agora sao criados/avaliados atomicamente por Lua; suite concorrente e cobertura aprovadas |
| 2026-07-21 | `pnpm audit --audit-level high` | Registry npm | PASS_WITH_MODERATE_FINDING | Zero high/critical; permanece uma moderada transitiva de tooling registrada em DEV-0028 |
| 2026-07-21 | Reset controlado final + duas migrations + verify/check | PostgreSQL local descartavel | PASS | `applied=2`, depois `applied=0`; `LYVOX_DB_VERIFY_OK tables=26`; dados temporarios removidos |
| 2026-07-21 | Revisoes sequenciais SPEC, qualidade/seguranca e auditoria final | Tres revisores independentes, somente leitura | PASS | Achados tecnicos e duas inconsistencias documentais foram corrigidos; repeticoes aprovaram e a auditoria final retornou `READY_TO_APPROVE` |

## PHASE-007

| Data | Comando/checagem | Ambiente | Resultado | Evidencia |
|---|---|---|---|---|
| 2026-07-21 | `pnpm --filter @lyvox/permissions test` | Node 20.20.2 / Vitest 4.1.10 | PASS | 4/4 testes de chave, deny-by-default, ownership, assignment, uniao de scopes e matriz operacional |
| 2026-07-21 | `pnpm --filter @lyvox/api test` | NestJS/Fastify + PostgreSQL 16 efemero/Redis local | PASS | 33/33 testes; matriz completa dos cinco cargos, TEST-004 HTTP 403, custom role, revogacao viva, soft-delete, MFA administrativo e ownership incluidos |
| 2026-07-21 | `vitest run --coverage` | API e pacote permissions | PASS | API 95,67% linhas/81,00% branches; permissions 94,73% linhas/88,88% branches; thresholds 80% ativos |
| 2026-07-21 | Migration 0003 duas vezes + `db:verify` | PostgreSQL 16 local via PgBouncer | PASS | Primeira `applied=1`, segunda `applied=0`; `LYVOX_DB_VERIFY_OK tables=26`; SHA-256 da migration 0003 `384bbe4374b8618c300fcf1524cfb526173055e367ea5e8ae18452644bdf23f0` |
| 2026-07-21 | `db:seed` + `db:seed:verify` | PostgreSQL 16 local | PASS | Cinco cargos, 18 permissoes, 47 vinculos e scopes canonicos verificados sem expor credencial temporaria |
| 2026-07-21 | frozen install, typecheck, lint, build e suite raiz | Node 20.20.2 / pnpm 10.34.5 | PASS | 47/47 testes; lint final zero warnings/erros e build/typecheck aprovados |
| 2026-07-21 | `pnpm dev:verify` | Turbo + Nest/Fastify real | FAIL_RESOLVED | Metadata implicita de `Reflector` falhou no `tsx`; `@Inject(Reflector)` explicito corrigiu e repeticao confirmou api/web/worker |
| 2026-07-21 | `pnpm audit --audit-level high` | Registry npm | PASS_WITH_MODERATE_FINDING | Zero high/critical; uma moderada transitiva de tooling permanece em DEV-0028 |
| 2026-07-21 | Revisao SPEC 1/3 inicial + repeticao focal | Diff staged | FAIL_RESOLVED | Scope restrito em permissao sem ownership foi bloqueado em duas camadas; teste HTTP rejeita `users.manage/OWN` e suites focais permanecem verdes |
| 2026-07-21 | Revisao SECURITY 2/3 inicial + repeticao apos correcao | Diff staged + PostgreSQL 16 efemero + runtime development | FAIL_RESOLVED_PASS | Scopes `OWN`/`ASSIGNED` atravessam guard/contexto e filtram no mesmo `WHERE`; HTTP prova own/cross-owner e assigned/cross-assignee; migration-only prova backfill sem seed; harness retorna 404 em `NODE_ENV=development`; repeticao aprovou sem bypass/regressao |
| 2026-07-21 | Revisao QA final 3/3 inicial + repeticao documental | Diff staged + evidencias do gate | FAIL_RESOLVED_PASS | Primeira leitura rejeitou apenas cobertura/status fora do indice; apos staging, confirmou valores finais, zero marcadores obsoletos, escopo honesto e todos os criterios do GATE-007 |
