# 01 — Visão do Produto, Escopo e Princípios

- **Documento ID:** DOC-01
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Solution & Product Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [00-INDICE-MESTRE-E-STATUS.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/00-INDICE-MESTRE-E-STATUS.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Diretrizes de Produto Lyvox

---

## 1. Visão Geral e Problema

### 1.1 Contexto
A **Lyvox** necessita de um sistema empresarial centralizado de gestão denominado **Lyvox Gerenciamento**, concebido integralmente do zero (*Clean Greenfield*). O sistema abrange a gestão operacional, comercial, financeira, de projetos, reuniões, automações, arquivos e inteligência assistida, operando de forma autônoma em infraestrutura própria (*self-hosted* VPS).

### 1.2 Problema Solucionado
A ausência de uma plataforma empresarial consolidada gera fragmentação de informações, baixa visibilidade financeira/operacional, dependência de serviços BaaS com custos crescentes e falta de governança sobre dados e automações.

### 1.3 Objetivos Principais
1. Prover uma plataforma única para gestão de clientes, CRM/leads, reuniões, serviços, propostas/contratos, projetos/tarefas, financeiro, marketing e automações.
2. Garantir independência total de plataformas BaaS (Supabase, Firebase, Vercel Runtime).
3. Assegurar alta performance, segurança rigorosa (RBAC granular), observabilidade ponta a ponta e integridade transacional no PostgreSQL self-hosted.
4. Integrar capacidade de automação local (n8n) e inteligência artificial assistida (Ollama local com abstração para APIs externas).

---

## 2. Atores e Personas (Classificação: PROPOSED_PRODUCT_REQUIREMENT)

| Ator | Papel | Nível de Acesso | Descrição / Responsabilidade |
|---|---|---|---|
| **Super Admin** | Administrador da Plataforma | Total (Global) | Gestão de infraestrutura, empresas, configurações globais e segurança. |
| **Gestor Executivo / Diretor** | Liderança Operacional | Alto (Organizacional) | Visualização de dashboards consolidados, relatórios financeiros e aprovações. |
| **Gerente de Projetos** | Gestão de Operações | Médio (Módulos de Operação) | Gestão de clientes, projetos, tarefas, reuniões e alocação de equipe. |
| **Vendedor / SDR** | Comercial | Médio (CRM & Vendas) | Gestão de pipeline de leads, reuniões de qualificação e emissão de propostas. |
| **Operacional / Analista** | Execução de Tarefas | Restrito (Tarefas Atribuídas) | Execução de tarefas em projetos, registro de notas e horas. |
| **Financeiro** | Gestão de Caixa | Médio (Módulo Financeiro) | Gestão de contas a pagar/receber, conciliação e relatórios de DRE. |
| **Sistema / Worker Assíncrono** | Automações & n8n | Serviço Interno | Processamento de filas, disparo de automações e execução de retries. |

---

## 3. Limites e Escopo do Sistema

### 3.1 Escopo Confirmado (REQ-CONF)
- **REQ-CONF-001:** Sistema empresarial criado integralmente do zero (*Greenfield*).
- **REQ-CONF-002:** Hospedagem em VPS própria sob Ubuntu Linux.
- **REQ-CONF-003:** Controle total da infraestrutura e stack de tecnologia.
- **REQ-CONF-004:** PostgreSQL e backend *self-hosted*.
- **REQ-CONF-005:** Proibição de uso de Supabase, Firebase ou BaaS equivalente.
- **REQ-CONF-006:** Arquitetura robusta, escalável e de alta performance.
- **REQ-CONF-007:** Capacidade para milhares de usuários cadastrados e centenas simultâneos.
- **REQ-CONF-008:** Baixa latência e integridade transacional estrita.
- **REQ-CONF-009:** Segurança por padrão (Deny by Default, TLS, RBAC, Audit Trail).
- **REQ-CONF-010:** Observabilidade total e deploys previsíveis.
- **REQ-CONF-011:** Minimização de dependências externas pagas.
- **REQ-CONF-012:** Integração com n8n local para fluxos complexos.
- **REQ-CONF-013:** Suporte a IA local via Ollama com fallback seguro.
- **REQ-CONF-014:** Execução de implementação delegada ao agente Codex.
- **REQ-CONF-015:** Atuação exclusivamente documental do agente Ottercraft.
- **REQ-CONF-016:** Nenhuma linha de código de produção criada nesta fase.
- **REQ-CONF-017:** Documentação 100% concluída e validada antes do código.

### 3.2 Fora do Escopo Inicial (OUT_OF_SCOPE)
- Aplicativo mobile nativo (iOS/Android).
- Arquitetura de microsserviços distribuídos no MVP.
- Orchestrador Kubernetes (k8s/k3s) ou Service Mesh no MVP.
- Event Sourcing integral e CQRS completo.
- Blockchain ou contratos inteligentes.
- Assinatura digital qualificada com certificado ICP-Brasil (apenas aceite eletrônico interno).
- Emissão de Nota Fiscal Eletrônica (NF-e/NFS-e) e integração bancária direta (Open Finance/OFX).
- Folha de pagamento e contabilidade fiscal completa.
- Cluster multi-datacenter / multi-região ativo-ativo.

---

## 4. Princípios Arquiteturais e de Produto

1. **Self-Hosted e Soberania dos Dados:** Toda a persistência, arquivos e logs residem na VPS sob domínio direto da empresa.
2. **Defesa em Profundidade:** Segurança em múltiplas camadas (Proxy, Firewall, App, Auth JWT/Cookies, RBAC, PostgreSQL Constraints).
3. **Simplicidade Operacional (Monólito Modular / Modulith):** Organização de código em módulos isolados com domínios claros, facilitando compilação, testes e eventual extração futura sem a complexidade de microsserviços.
4. **Resiliência e Operação Degradada:** O sistema central deve permanecer 100% operacional mesmo se serviços auxiliares (n8n, Ollama, Redis) estiverem indisponíveis.
5. **Rastreabilidade Transparente:** Todas as decisões técnicas, requisitos e artefatos de código possuem mapeamento bi-direcional.

---

## 5. Definição do MVP Empresarial

O MVP (Minimum Viable Product) contemplará 16 módulos operacionais base:
1. Identidade e Acesso (Auth & RBAC)
2. Dashboard Executivo
3. Gestão de Clientes
4. CRM e Leads
5. Gestão de Reuniões
6. Serviços e Tabela de Valores
7. Propostas e Contratos
8. Projetos e Tarefas (Kanban & Lista)
9. Financeiro (Contas a Pagar/Receber & Fluxo de Caixa)
10. Marketing & Calendário Editorial
11. Automações & Engine de Workflows
12. Central de Notificações
13. Gestão de Arquivos e Documentos
14. Configurações da Empresa e Sistema
15. Assistente de Inteligência Artificial
16. Trilha de Auditoria e Logs

---

## 6. Premissas e Restrições de Negócio

- **ASSUMPTION-001:** A VPS de referência possui recursos computacionais adequados (16 vCPU, 62 GB RAM, SSD NVMe) para suportar a stack completa em Docker Compose.
- **ASSUMPTION-002:** O volume de usuários simultâneos no MVP varia entre 50 e 500 conexões ativas.
- **ASSUMPTION-003:** O agente executor Codex seguirá rigorosamente este pacote de planejamento sem alterar decisões arquiteturais sem a criação prévia de um novo ADR.
