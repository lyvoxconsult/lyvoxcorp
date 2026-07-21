# 26 — Handoff Executivo para o Codex

- **Documento ID:** DOC-26
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Lead System Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** Todos os documentos do pacote (DOC-00 a DOC-25)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT

---

## 1. Contrato de Execução para o Agente Codex

Este documento formaliza o **Handoff Executivo** do pacote documental de planejamento aprovado do **Lyvox Gerenciamento** para o agente executor **Codex**.

> [!IMPORTANT]
> **TERMOS DO CONTRATO DE EXECUÇÃO:**
> O Codex assume a responsabilidade de implementar o sistema em código a partir dos 29 documentos fornecidos, respeitando os seguintes limites inegociáveis:
> 1. **Fidelidade Arquitetural 100%:** É proibido alterar stacks, ORMs, padrões de autenticação ou bibliotecas congeladas nos ADRs (DOC-23).
> 2. **Respeito aos Gates:** É proibidíssimo avançar uma fase sem que o Quality Gate da fase atual esteja 100% verificado.
> 3. **Proibição de Código Legado:** O desenvolvimento é 100% Greenfield em repositório novo.
> 4. **Sem Dados Falsos em Produção:** Dados de teste residem exclusivamente nos ambientes de dev e test.

---

## 2. Ordem de Leitura Recomendada para a Fase de Inicialização

Para assimilar o contexto técnico antes de iniciar a `PHASE-001`, o Codex deve ler os documentos na seguinte sequência priorizada:

1. **[00-INDICE-MESTRE-E-STATUS.md](./00-INDICE-MESTRE-E-STATUS.md):** Mapa geral do planejamento e status.
2. **[01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md](./01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md):** Visão de produto e limites de escopo.
3. **[02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md](./02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md):** Requisitos e regras funcionais.
4. **[05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](./05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md):** Stack congelada e arquitetura Modulith.
5. **[08-MODELAGEM-POSTGRESQL-E-DICIONARIO-DE-DADOS.md](./08-MODELAGEM-POSTGRESQL-E-DICIONARIO-DE-DADOS.md):** Dicionário de dados e schemas SQL.
6. **[09-CONTRATOS-API-REST-E-OPENAPI.md](./09-CONTRATOS-API-REST-E-OPENAPI.md):** Contratos de API e respostas RFC 7807.
7. **[10-AUTENTICACAO-RBAC-E-SEGURANCA.md](./10-AUTENTICACAO-RBAC-E-SEGURANCA.md):** Modelo de sessões opacas e matriz RBAC.
8. **[21-ROADMAP-DE-IMPLEMENTACAO-PARA-CODEX.md](./21-ROADMAP-DE-IMPLEMENTACAO-PARA-CODEX.md):** Fases sequenciais de execução (PHASE-000 a PHASE-030).
9. **[22-MATRIZ-DE-RASTREABILIDADE.md](./22-MATRIZ-DE-RASTREABILIDADE.md):** Matriz de rastreabilidade completa.

---

## 3. Prompt de Inicialização Recomendado para o Codex

Ao iniciar a fase de código, o seguinte prompt mestre deve ser fornecido ao Codex:

```text
Você é o Codex, agente executor de engenharia de software da Lyvox.

Você recebeu o pacote documental de planejamento Greenfield 100% certificado e aprovado localizado em:
docs/planejamento/

Sua missão é executar rigorosamente o roadmap do documento 21-ROADMAP-DE-IMPLEMENTACAO-PARA-CODEX.md, iniciando na PHASE-000 e avançando sequencialmente até a PHASE-030.

Regras invioláveis:
1. Respeite todas as decisões técnicas congeladas nos ADRs (05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md e 23-ADRS-DECISOES-ARQUITETURAIS.md).
2. Não crie JWT em localStorage ou Bearer tokens no browser. A autenticação utiliza obrigatoriamente Sessões Opacas Server-Side com cookies HttpOnly (10-AUTENTICACAO-RBAC-E-SEGURANCA.md).
3. Não pule nenhum Quality Gate. Execute a validação de cada fase antes de prosseguir.
4. Utilize a stack congelada: React 19 + Vite + TypeScript + Tailwind CSS no frontend; NestJS com adaptador Fastify no backend; PostgreSQL 16 com Drizzle ORM; Redis 7 + BullMQ para filas.
5. Inicie agora a PHASE-000 executando a verificação de integridade dos documentos.
```
