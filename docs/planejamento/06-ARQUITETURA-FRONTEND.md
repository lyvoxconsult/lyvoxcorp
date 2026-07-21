# 06 — Arquitetura Frontend

- **Documento ID:** DOC-06
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Frontend Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [04-UX-DESIGN-SYSTEM-E-ACESSIBILIDADE.md](./04-UX-DESIGN-SYSTEM-E-ACESSIBILIDADE.md), [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](./05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, React Documentation, Vite Guide, TanStack Query Docs

---

## 1. Visão Geral da Arquitetura Frontend

O frontend do **Lyvox Gerenciamento** é construído como uma aplicação Single Page Application (SPA) utilizando **React 19**, **Vite** e **TypeScript**. A arquitetura é organizada em *Feature Modules* (módulos funcionais isolados em `apps/web/`), promovendo clareza de escopo e facilidade de manutenção.

---

## 2. Estrutura de Diretórios do Frontend (`apps/web/`)

```text
apps/web/
├── public/
│   ├── favicon.ico
│   └── logo-lyvox.svg
├── src/
│   ├── assets/                # Imagens estáticas, fontes e vetores
│   ├── components/            # Componentes visuais globais (Design System)
│   │   ├── ui/                # Componentes base (Button, Input, Modal, Badge, Table)
│   │   ├── feedback/          # Toast, Skeleton, Spinner, ErrorBoundary
│   │   └── layout/            # Sidebar, Header, PageContainer, Breadcrumbs
│   ├── config/                # Configurações de ambiente (env.ts, constants.ts)
│   ├── hooks/                 # Custom React Hooks reutilizáveis (useDebounce, useMediaQuery)
│   ├── lib/                   # Configuração de bibliotecas (apiClient.ts, queryClient.ts)
│   ├── modules/               # Módulos Funcionais (Feature Modules)
│   │   ├── auth/              # Páginas de Login / Recuperação de Senha / MFA
│   │   ├── dashboard/         # Dashboard Executivo e KPI Cards
│   │   ├── clients/           # Gestão de Clientes e Detalhe 360°
│   │   ├── crm/               # CRM Kanban de Leads e Pipeline
│   │   ├── meetings/          # Agendamento e Atas de Reunião
│   │   ├── proposals/         # Propostas Comerciais e Contratos
│   │   ├── projects/          # Projetos e Tarefas
│   │   ├── financial/         # Contas a Pagar/Receber e Fluxo de Caixa Gerencial
│   │   ├── marketing/         # Calendário Editorial e Mídia
│   │   ├── automations/       # Painel de Workflows e n8n
│   │   ├── files/             # Central de Armazenamento de Arquivos
│   │   └── settings/          # Configurações Globais, Usuários e Auditoria
│   ├── routes/                # Definição de Rotas com React Router v6 (AppRoutes.tsx)
│   ├── services/              # Clientes de API REST
│   ├── store/                 # Gerenciamento de Estado do Cliente (Zustand - Apenas UI)
│   ├── types/                 # Definições de Tipos TypeScript Globais
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

## 3. Gerenciamento de Estado e Cliente HTTP

### 3.1 Separação Rigorosa de Estados
- **Server State (TanStack Query v5):** Gerencia 100% do estado assíncrono vindo da API REST (cache, invalidação automática, refetching em background, retries e rotas otimistas).
- **Client UI State (Zustand):** Gerencia estritamente preferências visuais do cliente (estado expandido/recolhido da sidebar, tema visual e paleta de comandos Cmd+K).
  > [!IMPORTANT]
  > **REGRA DE SEGURANÇA EM ZUSTAND / LOCALSTORAGE:**
  > É terminantemente proibido armazenar tokens, senhas, permissões definitivas do usuário ou dados sensíveis em stores do Zustand, `localStorage` ou `sessionStorage`.

### 3.2 Cliente HTTP e Sessões Opacas Server-Side (`apiClient.ts`)
- **Autenticação Transparente via Cookie:** A aplicação utiliza sessões opacas server-side. As requisições para a API incluem automaticamente o cookie `HttpOnly, Secure, SameSite=Lax` gerenciado pelo navegador (`credentials: 'include'`).
- **Proteção CSRF:** Requisições mutativas (POST, PUT, PATCH, DELETE) enviam o cabeçalho `X-CSRF-Token` obtido no handshake inicial da sessão e validam a origem no servidor.
- **Rastreabilidade (Correlation ID):** Adiciona o cabeçalho `X-Correlation-ID: <uuid>` em todas as requisições geradas no cliente para rastreabilidade nos logs do backend.

---

## 4. Formulários e Validação

- **React Hook Form:** Utilizado para manipulação de formulários sem re-renderizações desnecessárias.
- **Zod Schemas:** Todos os formulários possuem esquemas de validação compartilhados com os DTOs do backend via o pacote `@lyvox/validation`.
- **Formatação Nativa:** Utilitários baseados em `Intl.NumberFormat` para moeda BRL (R$) e `date-fns` para manipulação de datas no fuso horário `America/Sao_Paulo`.

---

## 5. Autorização Visual no Frontend

Componentes e rotas são protegidos no cliente por guards visuais de autorização que evitam a renderização desnecessária de telas e ações proibidas:

- **`<ProtectedRoute />` Component:** Envolve rotas privadas. Se a resposta da sessão indicar ausência da permissão requerida (ex: `permission="financial.read"`), a rota redireciona para a página `/403-forbidden`.
- **`<Can />` Component:** Envolve botões e ações dentro de uma tela para fins de UX.

---

## 6. Proibições Rígidas no Frontend

> [!CAUTION]
> **REGRAS INVIOLÁVEIS DE SEGURANÇA NO FRONTEND:**
> 1. **Zero Segredos e Chaves Privadas (Secrets):** É terminantemente proibido incluir tokens de serviço, senhas ou chaves privadas no código frontend.
> 2. **Validação de Permissão Definitiva:** O controle visual no frontend é apenas para experiência de usuário (UX). A decisão e bloqueio definitivo de autorização pertencem 100% ao backend NestJS/Fastify.
> 3. **Cálculos Financeiros Definitivos:** Regras de faturamento e lançamentos financeiros são processados e validados no backend. O frontend apenas exibe valores retornados pela API.
> 4. **Acesso Direto ao Banco:** Nenhuma consulta SQL ou biblioteca de banco de dados pode ser invocada a partir do navegador.
