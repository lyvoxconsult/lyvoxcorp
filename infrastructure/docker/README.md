# Docker local

O Compose raiz executa PostgreSQL 16, PgBouncer, Redis 7 e Mailpit em uma rede interna. PostgreSQL e Redis nao publicam portas; PgBouncer e Mailpit usam bind exclusivo em loopback pelo override de desenvolvimento.

Use somente os scripts raiz `pnpm infra:*`. O `.env` e gerado localmente, permanece ignorado e nunca deve ser versionado. `infra:reset` remove somente volumes do projeto Compose local e exige confirmacao explicita.
