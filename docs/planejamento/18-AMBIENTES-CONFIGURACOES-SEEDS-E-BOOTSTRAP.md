# 18 — Ambientes, Configurações, Seeds e Bootstrap

- **Documento ID:** DOC-18
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Environment & Config Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md), [10-AUTENTICACAO-RBAC-E-SEGURANCA.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/10-AUTENTICACAO-RBAC-E-SEGURANCA.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, 12-Factor App Methodology

---

## 1. Topologia de Ambientes

O **Lyvox Gerenciamento** contempla 4 ambientes operacionais estritamente isolados:

1. **Development (`development`):** Ambiente de desenvolvimento local rodando via Docker Compose.
2. **Test (`test`):** Ambiente isolado de execução de suítes de testes unitários e de integração no CI/CD com banco epêmero.
3. **Staging (`staging`):** Ambiente de homologação hospedado na VPS em contêineres idênticos à produção (*Environment Parity*), espelhando configurações sanitizadas.
4. **Production (`production`):** Ambiente de produção final com dados reais criptografados.

---

## 2. Variáveis de Ambiente e Schemas de Validação (Zod Schema)

> [!WARNING]
> **SEGURANÇA DE CREDENCIAIS:**
> Este documento lista apenas os nomes das variáveis de ambiente e seus tipos. É terminantemente proibido registrar valores reais de senhas, chaves privadas ou tokens no repositório.

### 2.1 Tabela de Variáveis do Backend (`apps/backend/.env.example`)

| Variável de Ambiente | Tipo | Obrigatoriedade | Valor Default Safe | Descrição |
|---|---|---|---|---|
| `NODE_ENV` | Enum | Sim | `development` | Ambiente (`development`, `test`, `staging`, `production`) |
| `PORT` | Number | Sim | `4000` | Porta HTTP de escuta da API Fastify |
| `HOST` | String | Sim | `0.0.0.0` | IP de ligação do servidor HTTP |
| `DATABASE_URL` | String (URI) | Sim | N/A | URI de conexão PostgreSQL com PgBouncer |
| `REDIS_URL` | String (URI) | Sim | `redis://localhost:6379` | URI de conexão com a instância Redis 7 |
| `JWT_SECRET` | String | Sim | N/A | Segredo de assinatura de tokens JWT (Min 64 chars) |
| `JWT_EXPIRES_IN` | String | Sim | `15m` | Tempo de expiração do Access Token |
| `REFRESH_TOKEN_EXPIRES_IN` | String | Sim | `7d` | Tempo de expiração do Refresh Token |
| `STORAGE_DRIVER` | Enum | Sim | `local` | Driver de armazenamento (`local` ou `minio`) |
| `STORAGE_PATH` | String | Sim | `/var/lib/lyvox/storage` | Caminho físico de arquivos locais |
| `N8N_WEBHOOK_SECRET` | String | Sim | N/A | Segredo para validação de assinatura HMAC n8n |
| `OLLAMA_BASE_URL` | String (URL) | Sim | `http://localhost:11434` | URL da API HTTP da instância Ollama local |
| `BOOTSTRAP_ADMIN_EMAIL` | String | Sim (Bootstrap) | N/A | E-mail inicial do administrador |
| `BOOTSTRAP_ADMIN_PASSWORD`| String | Sim (Bootstrap) | N/A | Senha inicial do administrador |

---

## 3. Scripts de Seed e Bootstrap Inicial

### 3.1 Script de Inicialização da Aplicação (`pnpm db:seed`)
O script de bootstrap popula o banco de dados recém-criado com as estruturas essenciais para a operação:

1. **Criação da Organização Mestre:** Registro da empresa inicial (`organizations`).
2. **Criação da Matriz de Roles e Permissões:** Cadastro dos papéis padrão (`Super Admin`, `Gestor Executivo`, `Gerente de Projetos`, `Vendedor`, `Analista`, `Financeiro`).
3. **Criação do Usuário Super Admin Inicial:** Atribuição do usuário mestre ao papel `Super Admin`.
4. **População de Categoria Base:** Inserção de categorias de serviços, despesas e receitas padrão.

---

## 4. Proibição de Reset em Ambiente de Produção

> [!CAUTION]
> **TRAVA DE SEGURANÇA CONTRA PERDA DE DADOS:**
> Os comandos de reset de banco de dados (`pnpm db:reset` ou `drizzle-kit drop`) contêm verificações de código que abortam imediatamente a execução caso a variável `NODE_ENV` seja igual a `production` ou `staging`. O descarte de banco em produção é terminantemente bloqueado via software.
