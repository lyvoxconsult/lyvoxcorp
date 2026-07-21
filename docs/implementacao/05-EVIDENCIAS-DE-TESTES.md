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
