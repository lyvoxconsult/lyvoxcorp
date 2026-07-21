# 27 — Checklist Mestre de Aceite

- **Documento ID:** DOC-27
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Quality Assurance & Acceptance Lead)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** Todos os documentos do pacote (DOC-01 a DOC-26)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Acceptance Criteria Standards

---

## 1. Visão Geral do Checklist Mestre de Aceite

Este documento especifica os **Critérios Objetivos de Aceite** que determinam se o sistema **Lyvox Gerenciamento** está pronto para ser homologado e colocado em produção. Todos os itens exigem verificação empírica e binária (`APROVADO` / `REPROVADO`).

---

## 2. Checklist Objetivo por Categoria

### 2.1 Produto e Escopo
- [ ] **CHK-PROD-001:** Todos os 16 módulos base (DOC-02) estão visíveis e funcionais no sistema.
- [ ] **CHK-PROD-002:** Nenhum código ou schema legado foi utilizado no desenvolvimento.

### 2.2 Frontend
- [ ] **CHK-FE-001:** Interface adota o tema Dark Mode com tokens de cores institucionais (DOC-04).
- [ ] **CHK-FE-002:** Não há erros no console JS do navegador durante a navegação entre telas.
- [ ] **CHK-FE-003:** Todos os formulários possuem validação de campos via Zod/React Hook Form.
- [ ] **CHK-FE-004:** O atalho `Cmd+K` / `Ctrl+K` abre a busca global em menos de 100ms.

### 2.3 Backend e API REST
- [ ] **CHK-BE-001:** Servidor Fastify responde a `/health` e `/readiness` com status HTTP 200 OK.
- [ ] **CHK-BE-002:** Todos os erros da API retornam no formato RFC 7807 contendo `correlationId`.
- [ ] **CHK-BE-003:** Requisições POST/PUT de faturamento exigem o cabeçalho `Idempotency-Key`.

### 2.4 Banco de Dados e Persistence
- [ ] **CHK-DB-001:** Todas as tabelas possuem as colunas obrigatórias (`id`, `organization_id`, `created_at`, `updated_at`, `version`).
- [ ] **CHK-DB-002:** Soft delete (`deleted_at`) funcional em clientes e entidades críticas.

### 2.5 Autenticação e RBAC
- [ ] **CHK-SEC-001:** Senhas são armazenadas com hash Argon2id (sem senhas em texto puro).
- [ ] **CHK-SEC-002:** Refresh Tokens são trafegados via cookies `HttpOnly, Secure, SameSite=Strict`.
- [ ] **CHK-SEC-003:** O perfil `Vendedor` recebe bloqueio HTTP 403 ao tentar acessar o módulo financeiro.

### 2.6 Filas e Jobs Assíncronos
- [ ] **CHK-JOB-001:** A geração de PDFs e envio de e-mails ocorrem em segundo plano via BullMQ.
- [ ] **CHK-JOB-002:** Jobs com falhas repetidas (3x) são movidos para a fila DLQ sem travar a API.

### 2.7 Storage e Arquivos Privados
- [ ] **CHK-FILE-001:** Uploads são salvos com nomes UUID e validação de Magic Bytes MIME Type.
- [ ] **CHK-FILE-002:** Downloads de arquivos exigem autenticação prévia (zero exposição estática).

### 2.8 Infraestrutura, Backup e Observabilidade
- [ ] **CHK-INF-001:** Proxy Caddy redireciona tráfego HTTP para HTTPS com certificado TLS válido.
- [ ] **CHK-INF-002:** O script de backup do PostgreSQL gera dump criptografado e envia offsite.
- [ ] **CHK-INF-003:** Grafana e Loki exibem logs JSON estruturados contendo `correlationId`.
