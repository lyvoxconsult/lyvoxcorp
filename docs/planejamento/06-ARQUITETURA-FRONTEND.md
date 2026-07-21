# 06 — Arquitetura Frontend

- **Documento ID:** DOC-06
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Frontend Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [04-UX-DESIGN-SYSTEM-E-ACESSIBILIDADE.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/04-UX-DESIGN-SYSTEM-E-ACESSIBILIDADE.md), [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, React Documentation, Vite Guide, TanStack Query Docs

---

## 1. Visão Geral da Arquitetura Frontend

O frontend do **Lyvox Gerenciamento** é construído como uma aplicação Single Page Application (SPA) moderna, utilizando **React 18/19**, **Vite** e **TypeScript**. A arquitetura é orientada a *Feature Modules* (módulos funcionais isolados), promovendo alta escalabilidade, isolamento de código e facilidade de manutenção por múltiplos desenvolvedores.

---

## 2. Estrutura de Diretórios do Frontend (`apps/frontend/`)

```text
apps/frontend/
├── public/
│   ├── favicon.ico
│   ├── logo-lyvox.svg
│   └── mockServiceWorker.js
├── src/
│   ├── assets/                # Imagens estáticas, fontes e vetores
│   ├── components/            # Componentes visuais globais (Design System)
│   │   ├── ui/                # Componentes base (Button, Input, Modal, Badge, Table)
│   │   ├── feedback/          # Toast, Skeleton, Spinner, ErrorBoundary
│   │   └── layout/            # Sidebar, Header, PageContainer, Breadcrumbs
│   ├── config/                # Configurações de ambiente (env.ts, constants.ts)
│   ├── context/               # React Contexts globais (AuthContext, ThemeContext)
│   ├── hooks/                 # Custom React Hooks reutilizáveis (useDebounce, useMediaQuery)
│   ├── lib/                   # Configuração de bibliotecas terceiras (axios.ts, queryClient.ts)
│   ├── modules/               # Módulos Funcionais (Feature Modules)
│   │   ├── auth/              # Páginas e componentes de Login / MFA
│   │   ├── dashboard/         # Dashboard Executivo e KPI Cards
│   │   ├── clients/           # Gestão de Clientes e Detalhe 360°
│   │   ├── crm/               # CRM Kanban de Leads e Pipeline
│   │   ├── meetings/          # Agendamento e Atas de Reunião
│   │   ├── proposals/         # Propostas Comerciais e Contratos
│   │   ├── projects/          # Projetos, Tarefas e Timesheet
│   │   ├── financial/         # Contas a Pagar/Receber e Fluxo de Caixa
│   │   ├── marketing/         # Calendário Editorial e Mídia
│   │   ├── automations/       # Painel de Workflows e n8n
│   │   ├── files/             # Central de Armazenamento de Arquivos
│   │   └── settings/          # Configurações Globais, Usuários e Auditoria
│   ├── routes/                # Definição de Rotas com React Router (AppRoutes.tsx)
│   ├── services/              # Clientes de API e SDKs REST
│   ├── store/                 # Gerenciamento de Estado do Cliente (Zustand Stores)
│   ├── types/                 # Definições de Tipos TypeScript Globais (OpenAPI DTOs)
│   ├── utils/                 # Funções Utilitárias (formatters, validators, date.ts)
│   ├── App.tsx                # Raiz da Aplicação e Providers
│   ├── main.tsx               # Ponto de Entrada Vite
│   └── index.css              # Estilos Globais e Tokens Tailwind CSS
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 3. Padrões de Gerenciamento de Estado e API Client

### 3.1 Separação de Estados
- **Server State (TanStack Query / React Query v5):** Gerencia 100% do estado assíncrono vindo da API REST (cache, invalidação automática, refetching em background, retries e rotas otimistas).
- **Client State (Zustand):** Gerencia estado global estritamente do cliente (usuário logado, preferências da sidebar, filtros temporários e estado do player de mídia/chat IA).
- **Local Component State (React `useState` / `useReducer`):** Gerencia controle interno de modais abertos/fechados, dados de rascunho de formulário não submetido e foco visual.

### 3.2 Cliente HTTP e Interceptores (`axios.ts`)
- **Autenticação Transparente:** Envio automático de cookies HTTP-Only de sessão ou cabeçalho `Authorization: Bearer <token>`.
- **Renovação Automática de Token (Silent Refresh):** Em respostas com status `HTTP 401 Unauthorized`, o interceptor axios pausa a requisição, invoca a rota `/api/v1/auth/refresh` e tenta novamente a requisição original de forma transparente para o usuário.
- **Rastreabilidade (Correlation ID):** Adiciona o cabeçalho `X-Correlation-ID: <uuid>` em todas as requisições geradas no navegador para permitir rastreamento nos logs do backend.

---

## 4. Formulários e Validação

- **React Hook Form:** Utilizado para manipulação de formulários sem re-renderizações desnecessárias da árvore de componentes React.
- **Zod Schemas:** Todos os formulários possuem esquemas de validação compartilhados com os DTOs de entrada do backend via TypeScript.
- **Tratamento de Máscaras e Formatação:** Utilitários nativos baseados em `Intl.NumberFormat` para moeda BRL (R$) e bibliotecas leves como `date-fns` para manipulação de datas no fuso horário `America/Sao_Paulo`.

---

## 5. Autorização Visual e RBAC no Frontend

Componentes e rotas são protegidos no cliente por guards visuais de autorização que evitam a renderização desnecessária de telas e ações proibidas ao perfil do usuário logado:

- **`<ProtectedRoute />` Component:** Envolve rotas privadas. Se o usuário não possuir a permissão requerida (ex: `permission="financial:read"`), a rota redireciona para a página `/403-forbidden`.
- **`<Can />` Component:** Envolve botões e ações dentro de uma tela:
  ```tsx
  <Can do="clients:delete">
    <Button variant="danger">Excluir Cliente</Button>
  </Can>
  ```

---

## 6. Proibições Rígidas no Frontend (O que NÃO pode estar no cliente)

> [!WARNING]
> **REGRAS INVIOLÁVEIS DE SEGURANÇA NO FRONTEND:**
> 1. **Segredos e Chaves Privadas (Secrets):** É terminantemente proibido incluir tokens de serviço (`service_role`), senhas de banco de dados ou chaves privadas no código frontend.
> 2. **Validação de Permissão Definitiva:** O controle visual no frontend é apenas para experiência de usuário (UX). A decisão e bloqueio definitivo de autorização pertencem 100% ao backend Fastify.
> 3. **Cálculos Financeiros Definitivos:** Descontos, juros, baixas financeiras e regras de faturamento devem ser calculados e validados no backend. O frontend apenas exibe valores calculados pela API.
> 4. **Acesso Direto ao Banco:** Nenhuma consulta SQL ou biblioteca de banco de dados pode ser invocada a partir do código do navegador.
