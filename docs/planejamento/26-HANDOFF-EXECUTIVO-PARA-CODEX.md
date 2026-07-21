# 26 — Handoff Executivo para o Codex

- **Documento ID:** DOC-26
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Lead Solution Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** Todos os documentos do pacote (DOC-00 a DOC-25)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT

---

## 1. Contrato de Execução e Autoridade do Agente Codex

O agente **Codex** é formalmente designado como o **IMPLEMENTATION_EXECUTOR** responsável por transformar a especificação documental produzida pelo Ottercraft no sistema funcional **Lyvox Gerenciamento**.

### 1.1 Limites de Autoridade do Codex
1. **Fontes Canônicas:** Os 29 documentos Markdown presentes em `<PROJECT_ROOT>/docs/planejamento/` são a única fonte canônica de verdade.
2. **Proibição de Leitura do Legado:** É expressamente proibido ao Codex pesquisar, ler, auditar, copular ou importar qualquer código, schema ou arquivo de projetos anteriores (`LEGACY_CODE_REUSE = NO`).
3. **Proibição de Alteração de ADRs:** O Codex não pode alterar a stack (Fastify, React, PostgreSQL, Drizzle, Redis) ou decisões arquiteturais registradas nos ADRs (DOC-23) sem a autorização prévia e criação de um novo ADR.
4. **Trabalho por Fases:** O Codex deve obrigatoriamente implementar o sistema fase por fase, respeitando a sequência e os Quality Gates declarados no **Roadmap (DOC-21)**.

---

## 2. Ordem Obrigatória de Leitura para o Codex

Antes de escrever qualquer linha de código, o Codex deve ler os documentos nesta ordem estrita:

```text
1. 00-INDICE-MESTRE-E-STATUS.md
2. 01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md
3. 02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md
4. 05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md
5. 06-ARQUITETURA-FRONTEND.md
6. 07-ARQUITETURA-BACKEND.md
7. 08-MODELAGEM-POSTGRESQL-E-DICIONARIO-DE-DADOS.md
8. 09-CONTRATOS-API-REST-E-OPENAPI.md
9. 10-AUTENTICACAO-RBAC-E-SEGURANCA.md
10. 21-ROADMAP-DE-IMPLEMENTACAO-PARA-CODEX.md
11. 23-ADRS-DECISOES-ARQUITETURAIS.md
12. 26-HANDOFF-EXECUTIVO-PARA-CODEX.md
```

---

## 3. Prompt de Inicialização Mestre para o Agent Codex

```text
================================================================================
PROMPT DE INICIALIZAÇÃO PARA O AGENTE EXECUÇÃO (CODEX)
================================================================================

Você é o CODEX, o IMPLEMENTATION_EXECUTOR responsável pela construção do sistema
empresarial LYVOX GERENCIAMENTO.

Sua única missão é implementar o sistema do zero (Clean Greenfield) seguindo
rigorosamente o planejamento arquitetural e documental criado pelo Ottercraft e
disponível em:

<PROJECT_ROOT>/docs/planejamento/

REGRAS INVIOLÁVEIS DE EXECUÇÃO:
1. NUNCA acesse, pesquise ou copie código do projeto legado.
2. NUNCA altere as escolhas de stack (Fastify + React + Drizzle + PostgreSQL + Redis).
3. NUNCA pule uma fase do roadmap (DOC-21) sem aprovar o Quality Gate correspondente.
4. NUNCA crie requisitos ou funções não mapeados nos documentos DOC-02 e DOC-22.
5. Em cada fase, execute os testes automatizados correspondentes (pnpm test).
6. Pare imediatamente e informe o usuário se encontrar uma decisão classificada como DECISION_BLOCKED.

INICIE AGORA A EXECUÇÃO PELA PHASE-000 E PHASE-001 DO ROADMAP (DOC-21).
================================================================================
```
