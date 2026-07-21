# 01 — Visão do Produto, Escopo e Princípios

- **Documento ID:** DOC-01
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Solution & Product Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [00-INDICE-MESTRE-E-STATUS.md](./00-INDICE-MESTRE-E-STATUS.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, Diretrizes de Produto Lyvox

---

## 1. Visão Geral e Problema

### 1.1 Contexto
A **Lyvox** necessita de um sistema empresarial centralizado de gestão denominado **Lyvox Gerenciamento**, concebido integralmente do zero (*Clean Greenfield*). O sistema abrange a gestão operacional, comercial, financeira, de projetos, reuniões, automações, arquivos e inteligência assistida, operando de forma autônoma em infraestrutura própria (*self-hosted* VPS).

### 1.2 Modelo de Uso Organizacional (USER_APPROVED_FOR_PLANNING)
- **Modelo Inicial:** Organização Única (`SINGLE_ORGANIZATION = LYVOX`).
- **Público-Alvo:** Equipe interna da Lyvox.
- **Cadastro Público:** Desativado (`PUBLIC_REGISTRATION = NO`). Criação de usuários exclusiva por administradores via convite.
- **SaaS Multi-Tenancy:** Fora do escopo inicial (`OUT_OF_SCOPE_INITIAL`).

### 1.3 Problema Solucionado
A ausência de uma plataforma empresarial consolidada gera fragmentação de informações, baixa visibilidade financeira/operacional, custos desnecessários com serviços gerenciados e falta de governança sobre dados e automações.

### 1.4 Objetivos Principais
1. Prover uma plataforma única para gestão de clientes, CRM/leads, reuniões, serviços, propostas/contratos, projetos/tarefas, financeiro, marketing e automações.
2. Garantir independência total de plataformas BaaS (Supabase, Firebase, Vercel Runtime).
3. Assegurar alta performance, segurança por padrão (RBAC granular com sessões opacas), observabilidade e integridade de dados no PostgreSQL self-hosted.
4. Integrar automação local (n8n) e inteligência artificial assistida (Ollama local com operação degradada).

---

## 2. Atores e Perfis Iniciais (USER_APPROVED_FOR_PLANNING)

| Ator | Papel Inicial | Nível de Acesso | Descrição / Responsabilidade |
|---|---|---|---|
| **Administrador** | Administrador do Sistema | Total (Interno Lyvox) | Gestão de usuários, configurações globais, RBAC e segurança. |
| **Gestão** | Liderança Operacional | Alto | Visualização de dashboards consolidados, relatórios gerenciais e aprovações. |
| **Comercial** | Gestão de Vendas & CRM | Médio (CRM & Vendas) | Gestão de pipeline de leads, reuniões de qualificação e emissão de propostas. |
| **Operacional** | Execução de Projetos | Restrito (Tarefas Atribuídas) | Execução de tarefas em projetos e registro de notas. |
| **Financeiro** | Gestão Financeira | Médio (Módulo Financeiro) | Gestão de contas a pagar/receber, conciliação e relatórios de fluxo de caixa. |

---

## 3. Limites e Escopo do Sistema

### 3.1 Escopo Confirmado Inicial (USER_APPROVED_FOR_PLANNING)
- Sistema empresarial criado integralmente do zero (*Greenfield*).
- Hospedagem em VPS própria sob Ubuntu Linux (16 vCPU, 62 GiB RAM de referência).
- PostgreSQL 16 e backend *self-hosted* em NestJS/Fastify.
- Proibição de uso de Supabase, Firebase ou BaaS equivalente.
- Arquitetura Monólito Modular (*Modulith*) em monorepo pnpm + Turborepo.
- Segurança por padrão (Deny by Default, Sessões Opacas Server-Side, RBAC, Trilha de Auditoria).
- Observabilidade com Pino JSON, Prometheus, Grafana e Loki.
- Integração com n8n local via Transactional Outbox.
- Suporte a IA local via Ollama em modo degradado sem fallback pago.

### 3.2 Fora do Escopo Inicial (OUT_OF_SCOPE_INITIAL)
- Multi-tenancy SaaS e perfil Super Admin global.
- Portal de clientes externo e auto-registro público.
- Aplicativo mobile nativo.
- Integração bidirecional automática com Google Calendar (agendamento interno no MVP).
- Assinatura digital qualificada / ICP-Brasil e aceite eletrônico com valor jurídico garantido.
- Timesheet / apontamento de horas em tarefas.
- Emissão de Nota Fiscal Eletrônica (NF-e) e integração bancária direta / Open Finance.
- Publicação direta automática em redes sociais pelo módulo de marketing.
- Cluster multi-datacenter e Kubernetes.

---

## 4. Princípios Arquiteturais e de Produto

1. **Self-Hosted e Soberania dos Dados:** Toda a persistência, arquivos e logs residem na VPS sob domínio direto da empresa.
2. **Defesa em Profundidade:** Segurança em múltiplas camadas (Proxy Caddy, UFW, Sessões Opacas, RBAC, PostgreSQL Constraints).
3. **Simplicidade Operacional (Monólito Modular):** Organização de código em módulos isolados com domínios claros.
4. **Resiliência e Operação Degradada:** O sistema central permanece operacional mesmo se serviços auxiliares (n8n, Ollama, Redis) estiverem indisponíveis.
5. **Rastreabilidade Transparente:** Todas as decisões técnicas, requisitos e artefatos possuem mapeamento bi-direcional.

---

## 5. Definição do MVP Empresarial

O MVP contemplará 16 módulos operacionais base:
1. Identidade e Acesso (Sessões Opacas & RBAC)
2. Dashboard Executivo
3. Gestão de Clientes (PF/PJ)
4. CRM e Leads (Kanban & Funil)
5. Gestão de Reuniões (Ata & Transcrição)
6. Serviços e Tabela de Valores
7. Propostas e Contratos (PDF & Aprovação Interna)
8. Projetos e Tarefas (Lista, Kanban, Calendário, Gantt)
9. Financeiro (Contas a Pagar/Receber & Fluxo de Caixa Gerencial)
10. Marketing (Ideias & Calendário Editorial)
11. Automações & Engine n8n
12. Central de Notificações
13. Gestão de Arquivos e Documentos (Storage Privado Abstraído)
14. Configurações da Empresa e Sistema
15. Assistente e Inteligência Artificial (Ollama Local)
16. Trilha de Auditoria e Logs Imutáveis
