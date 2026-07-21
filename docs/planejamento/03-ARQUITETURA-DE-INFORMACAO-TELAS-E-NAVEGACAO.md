# 03 — Arquitetura de Informação, Telas e Navegação

- **Documento ID:** DOC-03
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (UX & Information Architect)
- **Classificação:** ARCHITECTURAL_DECISION / PROPOSED_PRODUCT_REQUIREMENT
- **Documentos Dependentes:** [01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md), [02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Diretrizes UI/UX Lyvox

---

## 1. Visão Geral da Arquitetura de Informação

O **Lyvox Gerenciamento** adota uma estrutura de navegação hierárquica clara, dividida em três grandes zonas visuais:
1. **Sidebar Principal (Navegação Global):** Acesso rápido aos módulos principais da organização.
2. **Header Superior (Contexto & Ações Globais):** Seletor de organização, busca global (Cmd+K), central de notificações, assistente IA e menu de perfil do usuário.
3. **Área de Conteúdo Principal (Workarea):** Exibição de estatísticas, tabelas, quadros Kanban, formulários e modais contextuais.

---

## 2. Mapa do Site (Sitemap) e Árvore de Navegação

```mermaid
graph TD
    Root[/] --> PublicArea[Área Pública]
    Root --> AppArea[Área Autenticada /app]

    PublicArea --> SCR_001[SCR-001: Login /login]
    PublicArea --> SCR_002[SCR-002: Recuperar Senha /recuperar-senha]
    PublicArea --> SCR_003[SCR-003: Aceite de Proposta /proposta/public/:token]

    AppArea --> SCR_010[SCR-010: Dashboard /app/dashboard]
    AppArea --> SCR_020[SCR-020: Clientes /app/clientes]
    AppArea --> SCR_030[SCR-030: CRM & Leads /app/crm]
    AppArea --> SCR_040[SCR-040: Reuniões /app/reunioes]
    AppArea --> SCR_050[SCR-050: Serviços /app/servicos]
    AppArea --> SCR_060[SCR-060: Propostas & Contratos /app/propostas]
    AppArea --> SCR_070[SCR-070: Projetos & Tarefas /app/projetos]
    AppArea --> SCR_080[SCR-080: Financeiro /app/financeiro]
    AppArea --> SCR_090[SCR-090: Marketing /app/marketing]
    AppArea --> SCR_100[SCR-100: Automações /app/automacoes]
    AppArea --> SCR_110[SCR-110: Arquivos /app/arquivos]
    AppArea --> SCR_120[SCR-120: Configurações /app/configuracoes]

    SCR_120 --> SCR_121[SCR-121: Usuários & RBAC /app/configuracoes/usuarios]
    SCR_120 --> SCR_122[SCR-122: Trilha de Auditoria /app/configuracoes/auditoria]
```

---

## 3. Especificação das Telas Principais (SCREEN-ID)

### 3.1 SCR-001: Login e Autenticação
- **Rota:** `/login`
- **Objetivo:** Autenticar usuários no sistema via e-mail e senha.
- **Atores:** Todos os usuários não autenticados.
- **Permissões:** Pública.
- **Componentes:** Card centralizado, logo Lyvox, formulário (inputs e-mail/senha), checkbox "Lembrar-me", botão "Entrar", link "Esqueceu a senha?".
- **Modais:** Modal de Desafio MFA TOTP (quando ativado).
- **Estados:** Padrão, Loading (spinner no botão), Erro (credenciais inválidas ou conta bloqueada).
- **Responsividade:** Layout responsivo centralizado adaptado a mobile e desktop.

### 3.2 SCR-010: Dashboard Executivo
- **Rota:** `/app/dashboard`
- **Objetivo:** Apresentar visão consolidadas das operações, finanças e tarefas prioritárias.
- **Atores:** Todos os usuários autenticados.
- **Permissões:** `dashboard:read`
- **Componentes:** Header de boas-vindas, grid de KPI Cards (Receita, MRR, Clientes, Leads, Tarefas), Gráfico de Fluxo de Caixa, Lista de Tarefas do Dia, Painel de Aprovações Pendentes.
- **Ações:** Clique em KPI navega para o módulo correspondente; botão de ação rápida "Novo Lead", "Nova Tarefa".
- **Estados:** Loading Skeleton, Empty State (para novos usuários sem dados), Error Boundary.

### 3.3 SCR-020: Gestão de Clientes (Listagem e Detalhes)
- **Rota:** `/app/clientes` | `/app/clientes/:id`
- **Objetivo:** Listar, cadastrar, editar e acompanhar o histórico completo de clientes.
- **Atores:** Gestores, Vendedores, Atendimento.
- **Permissões:** `clients:read`, `clients:write`
- **Componentes:** Tabela de clientes com busca e filtros (Status, Tag), botão "+ Novo Cliente", Drawer/Modal de formulário de cliente, aba de Histórico 360° no detalhe.
- **Modais:** Modal de confirmação de desativação (`Soft Delete`).

### 3.4 SCR-030: CRM & Pipeline de Leads (Kanban)
- **Rota:** `/app/crm`
- **Objetivo:** Gerenciar o funil de vendas visual de forma ágil via Kanban.
- **Atores:** SDRs, Vendedores, Diretores Comerciais.
- **Permissões:** `crm:read`, `crm:write`
- **Componentes:** Quadro Kanban com colunas arrastáveis (Drag and Drop), cards de oportunidade com valor estimado e responsável, barra de métricas do funil no topo.
- **Modais:** Modal de Cadastro de Lead, Modal de Motivo de Perda (ao arrastar para `Perdido`), Modal de Conversão em Cliente.

### 3.5 SCR-070: Projetos e Gestão de Tarefas
- **Rota:** `/app/projetos` | `/app/projetos/:id`
- **Objetivo:** Acompanhar a execução de projetos, tarefas, cronogramas e apontamento de horas.
- **Atores:** Gerentes de Projetos, Analistas, Operacional.
- **Permissões:** `projects:read`, `tasks:write`
- **Componentes:** Seletor de visão (Lista, Kanban, Calendário, Gantt), barra de progresso do projeto, tabela de tarefas com checkbox de conclusão rápida, painel lateral de detalhes da tarefa (comentários, anexos, timesheet).

### 3.6 SCR-080: Financeiro (Contas a Pagar/Receber & Fluxo de Caixa)
- **Rota:** `/app/financeiro`
- **Objetivo:** Controlar todas as movimentações financeiras de receitas e despesas.
- **Atores:** Financeiro, Direção.
- **Permissões:** `financial:read`, `financial:write`
- **Componentes:** Abas de navegação (Visão Geral, Contas a Receber, Contas a Pagar, Recorrências, DRE), tabela de lançamentos com badges de status (Pago, Pendente, Atrasado), modal de baixa financeira.

---

## 4. Estrutura de Rotas, Redirecionamentos e Tratamento de Erros

### 4.1 Tabela de Rotas da Aplicação

| Rota | Tipo | Proteção Auth | Permissão RBAC | Layout Base |
|---|---|---|---|---|
| `/login` | Pública | Não | Nenhuma | `AuthLayout` |
| `/recuperar-senha` | Pública | Não | Nenhuma | `AuthLayout` |
| `/app/dashboard` | Privada | Sim | `dashboard:view` | `AppLayout` |
| `/app/clientes` | Privada | Sim | `clients:read` | `AppLayout` |
| `/app/crm` | Privada | Sim | `crm:read` | `AppLayout` |
| `/app/reunioes` | Privada | Sim | `meetings:read` | `AppLayout` |
| `/app/propostas` | Privada | Sim | `proposals:read` | `AppLayout` |
| `/app/projetos` | Privada | Sim | `projects:read` | `AppLayout` |
| `/app/financeiro` | Privada | Sim | `financial:read` | `AppLayout` |
| `/app/marketing` | Privada | Sim | `marketing:read` | `AppLayout` |
| `/app/automacoes` | Privada | Sim | `automations:read` | `AppLayout` |
| `/app/arquivos` | Privada | Sim | `files:read` | `AppLayout` |
| `/app/configuracoes` | Privada | Sim | `settings:read` | `AppLayout` |
| `/app/configuracoes/usuarios` | Privada | Sim | `users:manage` | `AppLayout` |
| `/app/configuracoes/auditoria` | Privada | Sim | `audit:read` | `AppLayout` |

### 4.2 Telas de Erro e Exceção
- **Página 403 (Acesso Negado):** Exibida quando um usuário tenta acessar uma rota sem a permissão RBAC necessária. Apresenta explicação amigável e botão "Voltar ao Dashboard".
- **Página 404 (Não Encontrado):** Exibida para URLs inexistentes no sistema.
- **Página 500 (Erro Interno):** Renderizada por *Error Boundaries* quando ocorre uma falha inesperada no React. Inclui botão de "Recarregar página" e envio automático do log de erro.
- **Modo de Manutenção (`/maintenance`):** Exibido para usuários não administradores quando o sistema está em janela de atualização programada.

---

## 5. Busca Global (Cmd + K) e Atalhos de Teclado

O sistema disponibiliza uma paleta de comandos acessível via `Cmd + K` (macOS) ou `Ctrl + K` (Windows/Linux) permitindo:
- Busca instantânea de Clientes por Nome/CNPJ.
- Busca rápida de Tarefas por ID ou Título.
- Navegação direta para qualquer módulo ou tela do sistema.
- Execução de Ações Rápidas: "Criar novo lead", "Agendar reunião", "Lançar despesa".
