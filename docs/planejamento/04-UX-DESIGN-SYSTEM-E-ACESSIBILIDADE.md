# 04 — UX, Design System e Acessibilidade

- **Documento ID:** DOC-04
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (UX/UI Designer & Accessibility Specialist)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md](./01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md), [03-ARQUITETURA-DE-INFORMACAO-TELAS-E-NAVEGACAO.md](./03-ARQUITETURA-DE-INFORMACAO-TELAS-E-NAVEGACAO.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, Diretrizes de Marca Lyvox, WCAG 2.2 AA Standards

---

## 1. Diretrizes de Identidade Visual e Estética Premium

Em conformidade com a identidade visual da **Lyvox**, a interface do **Lyvox Gerenciamento** adota um visual **Dark Mode Premium Empresarial**. O design prioriza alto contraste, componentes refinados, tipografia editorial moderna e elementos visuais tecnológicos, evitando poluição gráfica.

---

## 2. Tokens de Design (Design Tokens)

### 2.1 Paleta de Cores Oficial (Theme Tokens) — USER_APPROVED_FOR_PLANNING

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

### 2.2 Tipografia (Typography Tokens) — USER_APPROVED_FOR_PLANNING

A combinação tipográfica oficial do sistema adota uma estética editorial elegante baseada nas seguintes fontes (Google Fonts):

- **Títulos Principais e Display (Headings H1):** `'Cormorant SC'`, serif (Small Caps sofisticado para títulos e chamadas principais).
- **Subtítulos e Seções (Headings H2 / H3):** `'Alegreya SC'`, serif (Small Caps para subtítulos, cabeçalhos de cards e seções).
- **Texto de Corpo e Leitura (Body / Parágrafos):** `'Rasa'`, serif (Fonte serifada de alta legibilidade para parágrafos, tabelas e formulários).
- **Dados Numéricos / Código (Monospace):** `'JetBrains Mono'`, monospace (Para IDs, valores numéricos de KPIs e códigos).

#### Escala Tipográfica e Mapeamento

```json
{
  "typography": {
    "fontFamily": {
      "display": "'Cormorant SC', serif",
      "heading": "'Alegreya SC', serif",
      "body": "'Rasa', serif",
      "mono": "'JetBrains Mono', monospace"
    },
    "scale": {
      "display": {
        "fontSize": "32px",
        "lineHeight": "1.2",
        "fontWeight": "700",
        "fontFamily": "display"
      },
      "h1": {
        "fontSize": "24px",
        "lineHeight": "1.3",
        "fontWeight": "600",
        "fontFamily": "display"
      },
      "h2": {
        "fontSize": "20px",
        "lineHeight": "1.4",
        "fontWeight": "600",
        "fontFamily": "heading"
      },
      "h3": {
        "fontSize": "16px",
        "lineHeight": "1.4",
        "fontWeight": "500",
        "fontFamily": "heading"
      },
      "body": {
        "fontSize": "15px",
        "lineHeight": "1.5",
        "fontWeight": "400",
        "fontFamily": "body"
      },
      "caption": {
        "fontSize": "13px",
        "lineHeight": "1.4",
        "fontWeight": "400",
        "fontFamily": "body"
      }
    }
  }
}
```

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

1. **Button (Botão):** Variantes (`primary-blue`, `secondary-outline`, `ghost`, `danger`). Estados (`default`, `hover`, `active`, `focused`, `disabled`, `loading`).
2. **Input / Form Control:** Variantes (`text`, `number`, `email`, `password`, `select`, `date-picker`, `currency-input`). Validação com borda vermelha e texto auxiliar de erro.
3. **DataTable (Tabela Dinâmica):** Suporte a ordenação de colunas, paginação por cursor no servidor, seleção de linhas, ações em lote e filtros por coluna.
4. **Modal & Drawer:** Diálogos com foco aprisionado (`Focus Lock`), overlay escurecido com *backdrop-blur*, tecla `ESC` para fechar e acessibilidade de leitores de tela.
5. **Badge / Status Tag:** Indicadores de estado de registros (ex: `Ativo` [Verde], `Pendente` [Azul Suave], `Atrasado` [Vermelho]).
6. **KPI Card:** Card elevado com valor numérico destacado em `JetBrains Mono`, percentual de variação e ícone temático.
7. **Kanban Board & Card:** Quadro de arrastar colunas com indicadores visuais de urgência, tags e avatares dos responsáveis.
8. **Toast Notification:** Notificações flutuantes no canto superior direito com auto-dismiss (5s) e opção de fechamento manual.
9. **Skeleton Loader:** Animação de carregamento pulsante mantendo a estrutura do layout.
10. **Empty State Component:** Container visual informativo quando tabelas ou filtros não retornam dados, contendo ilustração/ícone e botão de chamada de ação ("Criar novo").

---

## 4. Requisitos de Acessibilidade (WCAG 2.2 AA)

- **A11Y-001 (Navegação por Teclado):** 100% dos elementos interativos (botões, links, inputs, modais) devem ser alcançáveis e operáveis exclusivamente via tecla `Tab`, `Enter` e `Space`.
- **A11Y-002 (Indicador Visual de Foco):** Todos os elementos em foco exibem anel visual destacado (`focus:ring-2 focus:ring-blue-500`).
- **A11Y-003 (Contraste Mínimo de Cores):** Relação de contraste de texto normal de no mínimo **4.5:1** em relação ao fundo; texto grande e ícones de no mínimo **3:1**.
- **A11Y-004 (Rótulos ARIA e Semântica):** Uso estrito de elementos semânticos (`<main>`, `<nav>`, `<header>`, `<table>`) e atributos ARIA (`aria-label`, `aria-expanded`, `role="dialog"`).
- **A11Y-005 (Suporte a Preferência de Animações):** Respeitar a propriedade do sistema `prefers-reduced-motion: reduce`, desativando transições e animações complexas.
