# 24 — Riscos, Premissas, Lacunas e Decisões Bloqueadas

- **Documento ID:** DOC-24
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Risk & Governance Officer)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** Todos os documentos anteriores (DOC-01 a DOC-23)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, ISO 31000 Risk Management Standard

---

## 1. Matriz de Gestão de Riscos Táticos e Operacionais

| RISK-ID | Categoria | Descrição do Risco | Probabilidade | Impacto | Detecção | Mitigação Arquitetural | Plano de Contingência | Gate Vinculado |
|---|---|---|:---:|:---:|---|---|---|:---:|
| **RISK-001** | Escopo | *Scope Creep* (Aumento de requisitos pelo executor Codex) | Média | Alto | Auditoria CI/CD | Matriz de Rastreabilidade estrita (DOC-22) | Interrupção imediata da PR | `GATE-DOC-020` |
| **RISK-002** | Segurança | RBAC Incorreto / Vazamento entre Organizacões | Baixa | Crítico | Testes RBAC | Trava obrigatória de `organization_id` em 100% das queries | Revogação de sessão | `GATE-DOC-009` |
| **RISK-003** | Dados | Perda de Dados por Falha de Migration | Baixa | Crítico | Teste CI/CD | Padrão *Expand and Contract* e backup automático pré-migration | Rollback de snapshot DB | `GATE-DOC-007` |
| **RISK-004** | Infra | Sobrecarga de CPU/RAM na VPS (Ollama + Backend) | Média | Alto | Prometheus | Resource limits estritos no Docker Compose | Desativação temporária da IA | `GATE-DOC-013` |
| **RISK-005** | Infra | Esgotamento de Espaço em Disco NVMe (Logs/Arquivos)| Média | Crítico | Alerta Loki | Limpeza automatizada de temp files e log rotation | Expansão do volume NVMe | `GATE-DOC-013` |
| **RISK-006** | Operação | Indisponibilidade do n8n ou Fila Parada | Média | Médio | Bull-Board | Transactional Outbox Pattern e DLQ com retries | Processamento manual | `GATE-DOC-011` |
| **RISK-007** | Operação | Indisponibilidade da IA Local (Ollama Down) | Média | Baixo | Healthcheck | Abstração `AiProvider` com modo de operação degradada | Sistema roda 100% sem IA | `GATE-DOC-014` |
| **RISK-008** | Infra | Ponto Único de Falha (Single Point of Failure - VPS) | Alta | Alto | Uptime Monitor| Resiliência de contêineres e backup offsite diário | Restore em nova VPS (RTO 4h) | `GATE-DOC-017` |

---

## 2. Consolidação de Premissas (ASSUMPTION)

- **ASSUMPTION-001:** A VPS de referência possui 16 vCPU, 62 GB RAM e SSD NVMe de alta velocidade rodando Ubuntu Linux LTS.
- **ASSUMPTION-002:** O volume de usuários concorrentes durante o primeiro ano oscilará entre 50 e 500 conexões ativas.
- **ASSUMPTION-003:** O agente Codex executará rigorosamente as fases do roadmap sem alterar ADRs ou criar código fora do especificado.

---

## 3. Consolidação de Lacunas (UNKNOWN)

- **UNKNOWN-001:** O IP estático e as credenciais exatas de acesso SSH da VPS de produção serão fornecidos apenas na fase de deploy.
- **UNKNOWN-002:** As chaves de API do provedor de e-mail transacional (SMTP) serão configuradas diretamente nas variáveis de ambiente de produção.

---

## 4. Consolidação de Decisões Bloqueadas (DECISION_BLOCKED)

- **DECISION-BLOCKED-001:** *Integração com Emissão de Nota Fiscal Eletrônica e Open Finance bancário direto*.
  - **Informação Ausente:** Definição da empresa de contabilidade e provedor de API fiscal/bancária.
  - **Impacto:** Recursos mantidos como `OUT_OF_SCOPE` no MVP.
  - **Default Conservador:** Registro manual de lançamentos financeiros e exportação em CSV/PDF.
  - **Momento Limite:** Versões futuras (Roadmap P2).
