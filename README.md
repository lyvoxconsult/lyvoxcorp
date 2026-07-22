# Lyvox Gerenciamento

Plataforma empresarial interna da Lyvox, implementada em modo clean greenfield a partir do pacote canonico versionado em [`docs/planejamento/`](docs/planejamento/00-INDICE-MESTRE-E-STATUS.md).

## Estado

- Planejamento canonico: `2.0.0`.
- Execucao: fases sequenciais `PHASE-000..PHASE-030`.
- Estado persistido: [`docs/implementacao/00-ESTADO-DA-EXECUCAO.md`](docs/implementacao/00-ESTADO-DA-EXECUCAO.md).
- Projeto legado: acesso e dependencia proibidos.

## Stack congelada

- Monorepo pnpm + Turborepo.
- React 19, Vite e TypeScript.
- NestJS com Fastify.
- PostgreSQL 16, Drizzle ORM e PgBouncer.
- Redis 7 e BullMQ.
- Docker Compose v2 e Caddy.

## Bootstrap do workspace

Requisitos: Node `20.20.2` e pnpm `10.34.5`. O projeto rejeita outro major de Node ou pnpm.

```powershell
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm list --depth -1 -r
pnpm dev
```

`pnpm dev` inicia `web`, `api` e `worker` simultaneamente pelo Turborepo. Enquanto as aplicacoes ainda nao possuem codigo funcional, cada workspace mantem um processo de desenvolvimento explicitamente identificado como scaffold; o comando sera substituido pelo runtime real na fase proprietaria de cada app. Verifique a concorrencia de forma automatizada com `pnpm dev:verify`.

Os comandos de build, lint, teste e typecheck tambem estao orquestrados no `package.json` raiz; cada app/pacote recebera sua implementacao nas fases seguintes. Nao use este README como substituto dos documentos canonicos.

## Infraestrutura local

Docker Desktop com Compose v2 deve estar ativo. O primeiro comando gera `.env` local com senha aleatoria, valida o manifesto, inicia os quatro servicos e executa os testes de saude:

```powershell
pnpm infra:up
pnpm infra:health
pnpm infra:down
```

PgBouncer fica em `127.0.0.1:6432`; Mailpit usa SMTP em `127.0.0.1:1025` e interface em `http://127.0.0.1:8025`. PostgreSQL e Redis nao publicam portas no host. `infra:down` preserva dados. O reset destrutivo e restrito a development/test e exige `pnpm infra:reset -- --confirm-local-data-loss`.

## Limites dos pacotes

Pacotes nunca importam `apps/*`. Dependencias internas usam `workspace:*` e seguem apenas estas direcoes:

| Pacote | Responsabilidade | Pode depender de |
|---|---|---|
| `config` | Contratos tipados de configuracao por ambiente | Nenhum pacote interno |
| `shared` | Utilitarios puros, deterministas e sem regra de dominio | Nenhum pacote interno |
| `validation` | Primitivas e schemas reutilizaveis de validacao | `shared` |
| `contracts` | DTOs, eventos e contratos compartilhados | `validation`, `shared` |
| `permissions` | Tipos e politicas puras de autorizacao | `contracts`, `shared` |
| `auth` | Dominio e portas de identidade/sessao | `contracts`, `permissions`, `validation`, `shared` |
| `observability` | Logging, metricas e tracing comuns | `config`, `shared` |
| `database` | Schema, migrations e adaptadores PostgreSQL | `config`, `observability`, `shared` |

Apps compoem esses pacotes. Novas arestas exigem justificativa tecnica, nao podem criar ciclo e devem manter regra de negocio fora de `shared`.
