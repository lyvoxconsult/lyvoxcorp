# 10 — Autenticação, RBAC e Segurança

- **Documento ID:** DOC-10
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Security Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](./05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md), [07-ARQUITETURA-BACKEND.md](./07-ARQUITETURA-BACKEND.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, OWASP Top 10 Security Risks, NIST Special Publication 800-63B

---

## 1. Arquitetura do Sistema de Autenticação

Em conformidade com a decisão técnica congelada (ADR-007), o **Lyvox Gerenciamento** adota um **Modelo de Sessão Opaca Server-Side (*Opaque Server-Side Session*)**. Esta abordagem elimina riscos de vazamento de tokens no navegador e fornece revogação instantânea de acessos.

### 1.1 Fluxo de Sessão e Cookies Criptografados
1. **Credenciais & Hash:** Autenticação via e-mail e senha com validação de hash em **Argon2id** (parâmetros NIST: memória 64MB, 3 iterações).
2. **Geração de Token Opaco:** No login bem-sucedido, o backend gera um token aleatório criptograficamente seguro de 64 bytes de entropia.
3. **Persistência Server-Side:** Apenas o hash SHA-256 do token é salvo no **PostgreSQL** (`sessions`) com réplica em cache no **Redis** (`lyvox:session:<token_hash>`).
4. **Transporte por Cookie Seguro:** O token opaco em texto puro é enviado ao navegador exclusivamente via cookie **`HttpOnly, Secure, SameSite=Lax`**. NENHUM token JWT ou credencial é armazenado em `localStorage` ou `sessionStorage`.
5. **Encerramento de Sessão:** No logout ou revogação administrativa, a sessão é destruída imediatamente no Redis e marcada como revogada no PostgreSQL.

---

## 2. Autenticação Multi-Fator (MFA TOTP)

- **Algoritmo:** Time-based One-Time Password (TOTP - RFC 6238) com segredos de 160 bits (QR Code compatível com Google Authenticator / Authy / Bitwarden).
- **Códigos de Backup:** 8 códigos de emergência de uso único armazenados com hash Argon2id no banco.
- **Obrigatoriedade:** Obrigatório para usuários com o papel `Administrador`.

---

## 3. Modelo de Autorização Granular (RBAC + Ownership)

O sistema adota a estratégia **Deny by Default** (Qualquer acesso não explicitamente permitido no perfil é bloqueado com HTTP 403).

### 3.1 Níveis de Controle
1. **Role-Based Access Control (RBAC):** Permissões no formato `recurso.ação` (ex: `clients.read`, `financial.pay`, `users.manage`).
2. **Resource Ownership:** Para perfis operacionais/comerciais, o acesso a determinados registros pode ser restrito ao criador ou responsável (`created_by_id = user.id` ou `owner_id = user.id`).

### 3.2 Matriz de Permissões dos 5 Cargos Iniciais (RBAC Matrix)

| Recurso / Permissão | Administrador | Gestão | Financeiro | Comercial | Operacional |
|---|:---:|:---:|:---:|:---:|:---:|
| `users.manage` | **SIM** | NÃO | NÃO | NÃO | NÃO |
| `roles.manage` | **SIM** | NÃO | NÃO | NÃO | NÃO |
| `dashboard.read` | **SIM** | **SIM** | **SIM** | **SIM** | **SIM** |
| `clients.read` | **SIM** | **SIM** | **SIM** | **SIM** | SOMENTE SEUS |
| `clients.create/update` | **SIM** | **SIM** | NÃO | **SIM** | NÃO |
| `clients.archive/delete`| **SIM** | **SIM** | NÃO | NÃO | NÃO |
| `crm.read/update` | **SIM** | **SIM** | NÃO | **SIM** | NÃO |
| `proposals.approve` | **SIM** | **SIM** | NÃO | NÃO | NÃO |
| `projects.read/update` | **SIM** | **SIM** | NÃO | NÃO | SOMENTE ATRIBUÍDOS |
| `financial.read/update` | **SIM** | **SIM** | **SIM** | NÃO | NÃO |
| `financial.pay` | **SIM** | **SIM** | **SIM** | NÃO | NÃO |
| `automations.manage` | **SIM** | NÃO | NÃO | NÃO | NÃO |
| `audit.read` | **SIM** | NÃO | NÃO | NÃO | NÃO |

---

## 4. Threat Modeling e Mitigações de Segurança (OWASP Top 10)

| ID Ameaça | Vetor de Ataque | Mecanismo de Mitigação Arquitetural |
|---|---|---|
| **SEC-001** | **XSS (Cross-Site Scripting)** | Sanitize automático de inputs, Content Security Policy (CSP) no Caddy/Vite, React previne XSS DOM. |
| **SEC-002** | **CSRF (Cross-Site Request Forgery)** | Cookies com `SameSite=Lax`, verificação de `Origin` e validação do cabeçalho `X-CSRF-Token` em mutações. |
| **SEC-003** | **SQL Injection** | Uso exclusivo do Drizzle ORM com consultas parametrizadas. Proibição de SQL concatenado. |
| **SEC-004** | **IDOR (Insecure Direct Object Reference)** | Validação de ownership e checagem de permissões `recurso.ação` em 100% das consultas por ID. |
| **SEC-005** | **Brute Force & Credential Stuffing** | Rate limiting por IP/Usuário no Caddy e Fastify (5 tentativas/minuto no login), lockout de 15 minutos via Redis. |
| **SEC-006** | **Session Fixation** | Invalidação e geração de nova sessão no login. Cookies com `HttpOnly, Secure, SameSite=Lax`. |
| **SEC-007** | **Vazamento de Segredos em Logs** | Filtro mascarador (Pino redact) ocultando campos como `password`, `token`, `session_cookie`. |
| **SEC-008** | **Supply Chain Vulnerabilities** | Varredura diária de dependências no CI/CD via `pnpm audit` e Socket.dev. Pins de versão no `pnpm-lock.yaml`. |

---

## 5. Bootstrap Administrativo Seguro

O primeiro usuário `Administrador` é criado durante a inicialização (`pnpm db:seed`) utilizando variáveis de ambiente de bootstrap (`BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD`). O script nunca imprime a senha em logs de produção e exige a troca obrigatória de senha e ativação do MFA no primeiro login.
