# 10 — Autenticação, RBAC e Segurança

- **Documento ID:** DOC-10
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Security Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md), [07-ARQUITETURA-BACKEND.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/07-ARQUITETURA-BACKEND.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, OWASP Top 10 Security Risks, NIST Special Publication 800-63B

---

## 1. Arquitetura do Sistema de Autenticação

Em conformidade com a decisao de stack (ADR-007), o **Lyvox Gerenciamento** adota um **Sistema de Autenticação Próprio** integrado ao backend Fastify. Esta escolha reduz a pegada de memória da VPS (evitando a execução de contêineres pesados como Keycloak) mantendo controle total sobre algoritmos criptográficos e autorização.

### 1.1 Fluxo de Tokens e Sessões
- **Access Token:** JSON Web Token (JWT) assinado com **RS256** ou **HS256** (segredo de 512 bits). Possui tempo de vida curto (**15 minutos**). Trafegado no cabeçalho `Authorization: Bearer <token>`. Contém `userId`, `organizationId`, `roleId` e lista compacta de permissões.
- **Refresh Token:** Token aleatório de alta entropia (64 bytes hex), armazenado de forma hash no banco e mantido em **Redis** para revogação instantânea. Trafegado exclusivamente via **HTTP-Only, Secure, SameSite=Strict Cookie**. Tempo de vida: **7 dias**.
- **Rotação de Refresh Tokens:** A cada renovação de token (`/api/v1/auth/refresh`), o Refresh Token antigo é invalidado imediatamente e um novo par de tokens é emitido. Se um Refresh Token reutilizado for detectado, todas as sessões daquele usuário são revogadas automaticamente (Detecção de Roubo de Sessão).

---

## 2. Autenticação Multi-Fator (MFA TOTP)

- **Algoritmo:** Time-based One-Time Password (TOTP - RFC 6238) com segredos de 160 bits (geração de QR Code compatível com Google Authenticator / Authy / Bitwarden).
- **Códigos de Backup:** 8 códigos de emergência de 8 caracteres alfanuméricos gerados na ativação. Armazenados com hash Argon2id no banco.
- **Obrigatoriedade:** Obrigatório para papéis com nível de privilégio `Super Admin` e `Administrador`.

---

## 3. Modelo de Autorização Granular (RBAC + ABAC / Ownership)

O sistema adota a estratégia **Deny by Default** (Qualquer acesso não explicitamente permitido no perfil é bloqueado com HTTP 403).

### 3.1 Níveis de Controle
1. **Organization Scope (Tenancy):** Todo recurso pertence a uma `organization_id`. Uma requisição nunca acessa dados de outra organização, independentemente do papel do usuário.
2. **Role-Based Access Control (RBAC):** Cargos definidos por permissões na forma `recurso:ação` (ex: `clients:read`, `financial:write`).
3. **Attribute/Ownership Control (ABAC):** Para perfis operacionais (ex: Vendedor / Analista), o acesso a determinados registros pode ser restrito ao criador ou responsável (`created_by_id = user.id` ou `owner_id = user.id`).

### 3.2 Matriz Principal de Permissões por Papel (RBAC Matrix)

| Recurso / Ação | Super Admin | Gestor Executivo | Gerente Projetos | Vendedor / SDR | Analista / Operacional | Financeiro |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `users:manage` | **SIM** | NÃO | NÃO | NÃO | NÃO | NÃO |
| `dashboard:read` | **SIM** | **SIM** | **SIM** | **SIM** | **SIM** | **SIM** |
| `clients:read` | **SIM** | **SIM** | **SIM** | **SIM** | SOMENTE SEUS | **SIM** |
| `clients:write` | **SIM** | **SIM** | **SIM** | **SIM** | NÃO | NÃO |
| `clients:delete` | **SIM** | **SIM** | NÃO | NÃO | NÃO | NÃO |
| `crm:read/write` | **SIM** | **SIM** | NÃO | **SIM** | NÃO | NÃO |
| `proposals:approve` | **SIM** | **SIM** | NÃO | NÃO | NÃO | NÃO |
| `projects:write` | **SIM** | **SIM** | **SIM** | NÃO | SOMENTE TAREFAS | NÃO |
| `financial:read/write`| **SIM** | **SIM** | NÃO | NÃO | NÃO | **SIM** |
| `automations:manage` | **SIM** | NÃO | NÃO | NÃO | NÃO | NÃO |
| `audit:read` | **SIM** | NÃO | NÃO | NÃO | NÃO | NÃO |

---

## 4. Threat Modeling e Mitigações de Segurança (OWASP Top 10)

| ID Ameaça | Vetor de Ataque | Mecanismo de Mitigação Arquitetural |
|---|---|---|
| **SEC-001** | **XSS (Cross-Site Scripting)** | Sanitize automático de inputs, Content Security Policy (CSP) rigoroso no Caddy/Vite, React previne `dangerouslySetInnerHTML`. |
| **SEC-002** | **CSRF (Cross-Site Request Forgery)** | Refresh Cookies com `SameSite=Strict`, headers customizados exigidos nas requisições AJAX (`X-Requested-With`). |
| **SEC-003** | **SQL Injection** | Uso exclusivo do Drizzle ORM com consultas parametrizadas. Proibição de concatenação crua de strings em SQL. |
| **SEC-004** | **IDOR (Insecure Direct Object Reference)** | Validação obrigatória da cláusula `organization_id` e permissão de ownership em 100% das consultas por ID no banco. |
| **SEC-005** | **Brute Force & Credential Stuffing** | Rate limiting por IP/Usuário no Caddy e Fastify (5 tentativas/minuto na rota `/login`), lockout de 15 minutos via Redis. |
| **SEC-006** | **Session Fixation** | Invalidação e geração de novo Session ID no login. Cookies emitidos com flag `HttpOnly` e `Secure`. |
| **SEC-007** | **Vazamento de Segredos em Logs** | Filtro mascarador (Pino redact) ocultando campos como `password`, `token`, `authorization`, `credit_card`. |
| **SEC-008** | **Supply Chain Vulnerabilities** | Varredura diária de dependências no CI/CD via `pnpm audit` e Socket.dev. Pins de versão fixos no `pnpm-lock.yaml`. |

---

## 5. Bootstrap Administrativo Seguro

O primeiro usuário `Super Admin` da plataforma é criado durante a inicialização do sistema (`seed.ts`) utilizando variáveis de ambiente de bootstrap (`BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD`). Caso essas variáveis não sejam fornecidas, o script gera uma senha aleatória de 32 caracteres no log inicial de instalação e força a troca imediata e ativação do MFA no primeiro acesso.
