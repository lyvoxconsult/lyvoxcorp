# 18 — Ambientes, Configurações, Seeds e Bootstrap

- **Documento ID:** DOC-18
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Environment & Config Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](./05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md), [10-AUTENTICACAO-RBAC-E-SEGURANCA.md](./10-AUTENTICACAO-RBAC-E-SEGURANCA.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, 12-Factor App Methodology

---

## 1. Topologia de Ambientes

O **Lyvox Gerenciamento** contempla 4 ambientes operacionais estritamente isolados:

1. **Development (`development`):** Ambiente local rodando via Docker Compose com Mailpit para captura de e-mails de teste.
2. **Test (`test`):** Ambiente de testes unitários e de integração no CI/CD com banco isolado.
3. **Staging (`staging`):** Ambiente de homologação hospedado na VPS espelhando configurações sanitizadas.
4. **Production (`production`):** Ambiente de produção final com a organização Lyvox.

---

## 2. Variáveis de Ambiente e Schemas de Validação (Zod Schema)

> [!WARNING]
> **SEGURANÇA DE CREDENCIAIS:**
> Este documento lista apenas os nomes das variáveis de ambiente e seus tipos. É terminantemente proibido registrar valores reais de senhas, chaves privadas ou tokens no repositório.

### 2.1 Tabela de Variáveis do Backend (`apps/api/.env.example`)

| Variável de Ambiente | Tipo | Obrigatoriedade | Valor Default Safe | Descrição |
|---|---|---|---|---|
| `NODE_ENV` | Enum | Sim | `development` | Ambiente (`development`, `test`, `staging`, `production`) |
| `PORT` | Number | Sim | `4000` | Porta HTTP de escuta do backend NestJS/Fastify |
| `HOST` | String | Sim | `0.0.0.0` | IP de ligação do servidor HTTP |
| `DATABASE_URL` | String (URI) | Sim | N/A | URI de conexão PostgreSQL com PgBouncer |
| `REDIS_URL` | String (URI) | Sim | `redis://localhost:6379` | URI de conexão com o Redis 7 |
| `SESSION_SECRET` | String | Sim | N/A | Segredo para assinatura de cookies de sessão (Min 64 chars) |
| `STORAGE_DRIVER` | Enum | Sim | `local` | Driver de armazenamento (`local`) |
| `STORAGE_PATH` | String | Sim | `/var/lib/lyvox/storage` | Caminho físico de arquivos locais na VPS |
| `N8N_WEBHOOK_SECRET` | String | Sim | N/A | Segredo para validação de assinatura HMAC n8n |
| `OLLAMA_BASE_URL` | String (URL) | Sim | `http://localhost:11434` | URL da API HTTP do Ollama local |
| `SMTP_HOST` | String | Sim | `localhost` | Host SMTP (Mailpit em dev, SMTP oficial em prod) |
| `BOOTSTRAP_ADMIN_EMAIL` | String | Sim (Bootstrap) | N/A | E-mail inicial do administrador Lyvox |
| `BOOTSTRAP_ADMIN_PASSWORD`| String | Sim (Bootstrap) | N/A | Senha inicial do administrador Lyvox |

---

## 3. Scripts de Seed e Bootstrap Inicial

### 3.1 Script de Inicialização da Aplicação (`pnpm db:seed`)
O script de bootstrap popula o banco de dados recém-criado com as estruturas essenciais:

1. **Criação da Organização Mestre:** Registro da organização Lyvox.
2. **Criação dos 5 Cargos Iniciais:** Cadastro dos cargos padrão (`Administrador`, `Gestão`, `Financeiro`, `Comercial`, `Operacional`).
3. **Criação das Permissões Base:** Mapeamento de permissões no formato `recurso.ação`.
4. **Criação do Usuário Administrador Inicial:** Atribuição do usuário mestre ao papel `Administrador`.
5. **População de Categorias Base:** Inserção de categorias de serviços, despesas e receitas padrão.

---

## 4. Proibição de Reset em Ambiente de Produção

> [!CAUTION]
> **TRAVA DE SEGURANÇA CONTRA PERDA DE DADOS:**
> Os comandos de reset de banco de dados (`pnpm db:reset`) contêm verificações de código que abortam imediatamente a execução caso a variável `NODE_ENV` seja igual a `production` ou `staging`. O descarte de banco nesses ambientes é bloqueado via software.
