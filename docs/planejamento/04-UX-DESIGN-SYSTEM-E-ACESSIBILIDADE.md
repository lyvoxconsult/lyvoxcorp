# 04 — UX, Design System e Acessibilidade

- **Documento ID:** DOC-04
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (UX/UI Designer & Accessibility Specialist)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md), [03-ARQUITETURA-DE-INFORMACAO-TELAS-E-NAVEGACAO.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/03-ARQUITETURA-DE-INFORMACAO-TELAS-E-NAVEGACAO.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Diretrizes de Marca Lyvox, WCAG 2.1 AA Standards

---

## 1. Diretrizes de Identidade Visual e Estética Premium

Em conformidade com a identidade visual da **Lyvox**, a interface do **Lyvox Gerenciamento** adota um visual **Dark Mode Premium Empresarial**. O design prioriza alto contraste, componentes refinados, tipografia moderna e elementos visuais tecnológicos, evitando poluição gráfica.

---

## 2. Tokens de Design (Design Tokens)

### 2.1 Paleta de Cores Oficial (Theme Tokens) — USER_CONFIRMED

A paleta de cores oficial do sistema é definida pelas seguintes variáveis e tokens institucionais:

```css
/* Paleta de Cores Fornecida (CSS Variables) */
.color1 { color: #4180ab; } /* Azul Aço Principal / Brand Primary */
.color2 { color: #ffffff; } /* Branco Puro / Contrast Text & Light Surface */
.color3 { color: #8ab3cf; } /* Azul Suave / Brand Secondary & Hover */
.color4 { color: #bdd1de; } /* Azul Gelo Claro / Bordas & Separadores */
.color5 { color: #e4ebf0; } /* Off-White Azulado / Superfícies & Cards Claros */
```

#### Token Mapping JSON

```json
{
  "color": {
    "brand": {
      "primary": "#4180ab",
      "primary-hover": "#35698d",
      "secondary": "#8ab3cf",
      "light": "#bdd1de",
      "surface-light": "#e4ebf0"
    },
    "background": {
      "default": "#0B0F19",
      "paper": "#111827",
      "subtle": "#1F2937",
      "light-card": "#e4ebf0",
      "overlay": "rgba(11, 15, 25, 0.8)"
    },
    "text": {
      "primary": "#ffffff",
      "secondary": "#bdd1de",
      "muted": "#8ab3cf",
      "dark-inverse": "#0B0F19"
    },
    "border": {
      "default": "#bdd1de",
      "hover": "#8ab3cf",
      "focus": "#4180ab"
    },
    "status": {
      "success": "#10B981",
      "warning": "#F59E0B",
      "error": "#EF4444",
      "info": "#4180ab"
    }
  }
}
```

### 2.2 Tipografia (Typography Tokens)
- **Fonte Principal (Sans-serif):** `Inter`, system-ui, sans-serif.
- **Fonte Monoespaçada (Monospace / Código / Valores):** `JetBrains Mono`, monospace.
- **Escala Tipográfica:**
  - Display (Headings grandes): 32px / Line Height: 1.2 / Weight: 700
  - H1 (Títulos de Tela): 24px / Line Height: 1.3 / Weight: 600
  - H2 (Seções): 20px / Line Height: 1.4 / Weight: 600
  - H3 (Subseções): 16px / Line Height: 1.4 / Weight: 500
  - Body Regular (Texto padrão): 14px / Line Height: 1.5 / Weight: 400
  - Caption / Badges: 12px / Line Height: 1.4 / Weight: 500

### 2.3 Grid, Breakpoints e Espaçamento
- **Escala de Espaçamento Base 4px:** `xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`, `2xl: 48px`.
- **Breakpoints Responsivos:**
  - `sm`: 640px (Mobile grande)
  - `md`: 768px (Tablet portrait)
  - `lg`: 1024px (Tablet landscape / Laptop pequeno)
  - `xl`: 1280px (Desktop padrão)
  - `2xl`: 1536px (Monitores grandes)

---

## 3. Catálogo de Componentes do Design System

Sem gerar código de implementação nesta fase documental, o catálogo abaixo especifica a biblioteca de componentes visuais padronizada:

1. **Button (Botão):** Variantes (`primary-gold`, `secondary-outline`, `ghost`, `danger`). Estados (`default`, `hover`, `active`, `focused`, `disabled`, `loading`).
2. **Input / Form Control:** Variantes (`text`, `number`, `email`, `password`, `select`, `date-picker`, `currency-input`). Validação com borda vermelha e texto auxiliar de erro.
3. **DataTable (Tabela Dinâmica):** Suporte a ordenação de colunas, paginação no servidor, seleção múltipla de linhas, ações em lote, filtros por coluna e visualização densa/expandida.
4. **Modal & Drawer:** Diálogos com foco aprisionado (`Focus Lock`), overlay escurecido com *backdrop-blur*, tecla `ESC` para fechar e acessibilidade de leitores de tela.
5. **Badge / Status Tag:** Indicadores de estado de registros (ex: `Ativo` [Verde], `Pendente` [Dourado], `Atrasado` [Vermelho]).
6. **KPI Card:** Card elevado com valor numérico destacado, percentual de variação em relação ao mês anterior e ícone temático.
7. **Kanban Board & Card:** Quadro de arrastar colunas com indicadores visuais de urgência, tags e avatares dos responsáveis.
8. **Toast Notification:** Notificações flutuantes no canto superior direito com auto-dismiss (5s) e opções de fechamento manual.
9. **Skeleton Loader:** Animação de carregamento pulsante no tom `#1F2937` para simulação visual da estrutura antes do carregamento dos dados reais.
10. **Empty State Component:** Container visual informativo quando tabelas ou filtros não retornam dados, contendo ilustração/ícone e botão de chamada de ação ("Criar novo").

---

## 4. Requisitos de Acessibilidade (WCAG 2.1 AA)

- **A11Y-001 (Navegação por Teclado):** 100% dos elementos interativos (botões, links, inputs, modais) devem ser alcançáveis e operáveis exclusivamente via tecla `Tab`, `Enter` e `Space`.
- **A11Y-002 (Indicador Visual de Foco):** Todos os elementos em foco exibem anel visual destacado (`focus:ring-2 focus:ring-amber-500`).
- **A11Y-003 (Contraste Mínimo de Cores):** Relação de contraste de texto normal de no mínimo **4.5:1** em relação ao fundo; texto grande e ícones de no mínimo **3:1**.
- **A11Y-004 (Rótulos ARIA e Semântica):** Uso estrito de elementos semânticos (`<main>`, `<nav>`, `<header>`, `<table>`) e atributos ARIA (`aria-label`, `aria-expanded`, `aria-describedby`, `role="dialog"`).
- **A11Y-005 (Suporte a Preferência de Animações):** Respeitar a propriedade do sistema `prefers-reduced-motion: reduce`, desativando transições e animações complexas para usuários sensíveis.

---

## 5. Estados da Interface de Usuário (UI States)

Toda tela ou componente interativo do sistema deve obrigatoriamente tratar 5 estados visuais:
1. **Initial / Default State:** Estado padrão renderizado com dados carregados.
2. **Loading State:** Estado de carregamento com *Skeletons* mantendo o layout estável sem saltos (*Cumulative Layout Shift - CLS = 0*).
3. **Empty State:** Interface limpa e explicativa quando não houver dados cadastrados.
4. **Error State:** Feedback claro de falha de conexão ou erro no servidor, oferecendo ação de "Tentar Novamente".
5. **Success State:** Confirmação visual para ações concluídas com êxito (toasts verdes / checkmarks).
