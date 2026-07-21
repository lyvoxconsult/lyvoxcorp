# 24 — Riscos, Premissas, Lacunas e Decisões Bloqueadas

- **Documento ID:** DOC-24
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Risk & Governance Officer)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** Todos os documentos do pacote (DOC-01 a DOC-23)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, ISO 31000 Risk Management Standard

---

## 1. Matriz de Gestão de Riscos Táticos e Operacionais

| RISK-ID | Categoria | Descrição do Risco | Probabilidade | Impacto | Detecção | Mitigação Arquitetural | Plano de Contingência | Gate Vinculado |
|---|---|---|:---:|:---:|---|---|---|:---:|
| **RISK-001** | Escopo | *Scope Creep* (Aumento de requisitos pelo executor Codex) | Média | Alto | CI/CD | Matriz de Rastreabilidade estrita (DOC-22) | Interrupção imediata da PR | `GATE-000` |
| **RISK-002** | Segurança | Falha de RBAC ou Vazamento de Sessão | Baixa | Crítico | Testes RBAC | Sessões Opacas Server-Side e verificações `recurso.ação` | Revogação de sessão | `GATE-007` |
| **RISK-003** | Dados | Perda de Dados por Falha de Migration | Baixa | Crítico | Teste CI/CD | Padrão *Expand and Contract* e backup automático pré-migration | Rollback de snapshot DB | `GATE-005` |
| **RISK-004** | Infra | Sobrecarga de CPU/RAM na VPS (Ollama + Backend) | Média | Alto | Prometheus | Resource limits estritos no Docker Compose (41 GiB limite) | Desativação temporária da IA | `GATE-022` |
| **RISK-005** | Infra | Esgotamento de Espaço em Disco (Logs/Arquivos) | Média | Crítico | Alerta Loki | Log rotation e limpeza automatizada de temp files | Expansão de volume NVMe | `GATE-019` |
| **RISK-006** | Operação | Indisponibilidade do n8n ou Fila Parada | Média | Médio | Bull-Board | Transactional Outbox Pattern e DLQ com retries | Processamento manual | `GATE-021` |
| **RISK-007** | Operação | Indisponibilidade da IA Local (Ollama Down) | Média | Baixo | Healthcheck | Modo de operação degradada sem fallback pago | Sistema roda 100% sem IA | `GATE-022` |
| **RISK-008** | Infra | Ponto Único de Falha (Single Point of Failure - VPS) | Alta | Alto | Uptime Monitor| Resiliência de contêineres e backup offsite diário (pgBackRest) | Restore em nova VPS (RTO 4h) | `GATE-029` |

---

## 2. Consolidação de Premissas (USER_APPROVED_FOR_PLANNING)

- **ASSUMPTION-001:** A VPS de referência possui 16 vCPU, 62 GiB RAM e SSD NVMe rodando Ubuntu Linux LTS.
- **ASSUMPTION-002:** O volume de usuários simultâneos no primeiro ano oscilará entre 50 e 500 conexões ativas.
- **ASSUMPTION-003:** O agente Codex executará rigorosamente as fases do roadmap sem alterar ADRs.

---

## 3. Consolidação de Lacunas (UNKNOWN)

- **UNKNOWN-001:** O IP estático e as credenciais SSH da VPS de produção serão fornecidos apenas na fase de deploy.
- **UNKNOWN-002:** As credenciais SMTP oficiais serão configuradas nas variáveis de ambiente de produção.

---

## 4. Consolidação de Decisões Bloqueadas (DECISION_BLOCKED)

- **DECISION-BLOCKED-001:** *Emissão de Nota Fiscal Eletrônica e Open Finance bancário direto*.
  - **Informação Ausente:** Definição da empresa de contabilidade e provedor de API fiscal/bancária.
  - **Impacto:** Mantido como `OUT_OF_SCOPE_INITIAL` no MVP.
  - **Default Conservador:** Registro manual de lançamentos financeiros e exportação gerencial.
  - **Momento Limite:** Versões futuras (Roadmap P2).
