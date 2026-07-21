# 17 — Estratégia de Testes, QA e Homologação

- **Documento ID:** DOC-17
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (QA & Software Testing Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md](./02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md), [07-ARQUITETURA-BACKEND.md](./07-ARQUITETURA-BACKEND.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, Vitest Guide, Playwright Documentation

---

## 1. Pirâmide e Estratégia de Testes

A garantia de qualidade do **Lyvox Gerenciamento** adota a pirâmide de testes automatizados:

```text
                  / \
                 /E2E\             (Playwright - 10% dos testes)
                /-----\
               / API / \           (Vitest + Supertest - 30% dos testes)
              /---------\
             /Integracao \         (Vitest + Testcontainers DB - 30% dos testes)
            /-------------\
           /   Unidade     \       (Vitest - 30% dos testes)
          /-----------------\
```

---

## 2. Metas de Cobertura e Qualidade (Quality Gates)

- **Cobertura Mínima de Código Backend:** **80% de linhas e ramificações (branches)** em testes de unidade e integração.
- **Cobertura Mínima de Código Frontend:** **70% de linhas** nos componentes do Design System e formulários.
- **Política de Flaky Tests:** Testes instáveis são imediatamente desativados do pipeline principal, isolados para correção em até 48h e proibidos de passar em staging sem correção.

---

## 3. Matriz de Casos de Testes Mapeados (TEST-ID)

| TEST-ID | Tipo de Teste | Requisito Mapeado | Cenário de Teste | Pré-condição | Resultado Esperado | Gate de Bloqueio |
|---|---|---|---|---|---|:---:|
| **TEST-001** | Unidade | FR-001 | Autenticação com senha correta e usuário ativo | Usuário cadastrado | Sessão opaca criada e Cookie HTTP-Only setado | GATE-DOC-016 |
| **TEST-002** | Unidade | BR-002 | Bloqueio de conta após 5 tentativas erradas | Usuário ativo | Conta bloqueada por 15 min (HTTP 429) | GATE-DOC-016 |
| **TEST-003** | Integração | FR-020 / BR-020 | Tentativa de cadastro de cliente com CNPJ duplicado | Cliente A cadastrado | Retorno HTTP 422 Unprocessable Entity | GATE-DOC-016 |
| **TEST-004** | Integração | FR-007 / BR-004 | Acesso de Comercial a módulo restrito de Usuários | Login como Comercial | Bloqueio imediato com HTTP 403 Forbidden | GATE-DOC-016 |
| **TEST-005** | E2E Visual | FR-030 | Drag and drop de card no Kanban de Leads | Navegador Playwright | Alteração de coluna salva e persistida | GATE-DOC-016 |
| **TEST-006** | E2E Fluxo | FR-063 | Aprovação de proposta e conversão em contrato | Proposta aprovada | Contrato e lançamento financeiro gerados | GATE-DOC-016 |
| **TEST-007** | Performance | NFR-008 | Carga concorrente de 100 RPS via k6 | 500 VUs virtuais k6 | Latência P95 < 250ms e erro < 0.5% | GATE-DOC-016 |
| **TEST-008** | Segurança | SEC-003 | Injeção SQL em campo de busca de clientes | Input `' OR 1=1 --` | Retorno seguro sem vazamento de dados | GATE-DOC-016 |
| **TEST-062** | N/A | FR-062 | Assinatura digital externa | N/A | `NOT_APPLICABLE_INITIAL` | N/A |
| **TEST-073** | N/A | FR-073 | Timesheet avançado | N/A | `NOT_APPLICABLE_INITIAL` | N/A |

---

## 4. Matriz de Navegadores e Dispositivos Homologados

- **Navegadores Desktop:** Google Chrome (últimas 2 versões), Mozilla Firefox (últimas 2 versões), Apple Safari (últimas 2 versões), Microsoft Edge.
- **Dispositivos Mobile (Web Responsiva):** Apple iPhone (iOS Safari), Android (Chrome), Tablets.
