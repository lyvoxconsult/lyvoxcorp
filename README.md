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

Comandos de desenvolvimento serao documentados quando o bootstrap do monorepo for aprovado no gate correspondente. Nao use este README como substituto dos documentos canonicos.
