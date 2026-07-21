# 15 — Observabilidade, SRE, SLI/SLO e Alertas

- **Documento ID:** DOC-15
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (SRE & Observability Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md), [14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Google SRE Book, OpenTelemetry Documentation

---

## 1. Pilares da Observabilidade Self-Hosted

A observabilidade do **Lyvox Gerenciamento** baseia-se nos três pilares fundamentais da engenharia de confiabilidade (SRE):

1. **Logs Estruturados (Loki + Pino):** Formato JSON padronizado com campos obrigatórios (`timestamp`, `level`, `correlationId`, `tenantId`, `userId`, `route`, `durationMs`).
2. **Métricas de Performance (Prometheus):** Coleta periódica de métricas de aplicação e infraestrutura (`http_requests_total`, `http_request_duration_seconds`, `db_pool_connections_active`, `bullmq_jobs_waiting`).
3. **Traces Distribuídos (OpenTelemetry + Tempo):** Rastreamento de chamadas ponta a ponta que correlaciona a requisição HTTP com as consultas SQL no PostgreSQL e chamadas a serviços externos.

---

## 2. Objetivos de Nível de Serviço (SLI / SLO)

Em conformidade com a declaração de infraestrutura em VPS única, os indicadores de confiabilidade (SLI) e metas (SLO) refletem métricas operacionais atingíveis e mensuráveis:

| Categoria | Indicador SLI | Meta SLO | Janela Medição | Plano de Medição |
|---|---|---|---|---|
| **Disponibilidade API** | Porcentagem de requisições HTTP retornando status != 5xx | **99.5%** | 30 dias rolantes | Prometheus (`http_requests_total`) |
| **Latência HTTP (P95)** | Tempo de resposta de rotas de leitura (GET) | **< 200ms** | 7 dias | Histogram OpenTelemetry |
| **Latência HTTP (P99)** | Tempo de resposta de rotas de escrita (POST/PUT) | **< 800ms** | 7 dias | Histogram OpenTelemetry |
| **Sucesso de Jobs** | Taxa de jobs assíncronos finalizados sem DLQ | **99.0%** | 30 dias | Métricas BullMQ |
| **Integridade de Backup**| Validação com êxito de teste de restore semanal | **100%** | Semanal | Script de teste automatizado |

---

## 3. Matriz de Alertas e Notificações de Incidente

Os alertas são emitidos via Prometheus Alertmanager e integrados com webhooks do Discord/Slack e e-mail dos administradores:

| ID Alerta | Regra de Disparo | Severidade | Ação Imediata (Runbook) |
|---|---|---|---|
| **ALT-001** | Taxa de Erro HTTP 5xx > 2% por 5 minutos | **CRÍTICO** | Inspecionar logs no Loki e acionar rollback se pós-deploy. |
| **ALT-002** | Uso de CPU na VPS > 90% por 10 minutos | **ALERTA** | Identificar processo/Worker com uso anormal. |
| **ALT-003** | Espaço em Disco NVMe < 15% livre | **CRÍTICO** | Executar limpeza de logs e descarte de temp files. |
| **ALT-004** | Filas BullMQ em DLQ > 10 jobs falhos | **ALERTA** | Acessar Bull-Board e verificar motivo de falha. |
| **ALT-005** | PostgreSQL Conexões Ativas > 85% do pool | **ALERTA** | Verificar queries lentas e conexões presas. |
