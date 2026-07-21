# 15 — Observabilidade, SRE, SLI/SLO e Alertas

- **Documento ID:** DOC-15
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (SRE & Observability Architect)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](./05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md), [14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md](./14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, Google SRE Book, OpenTelemetry Documentation

---

## 1. Pilares da Observabilidade Self-Hosted

A observabilidade do **Lyvox Gerenciamento** baseia-se em infraestrutura 100% self-hosted:

1. **Logs Estruturados (Pino JSON + Loki):** Formato JSON padronizado com campos obrigatórios (`timestamp`, `level`, `correlationId`, `userId`, `route`, `durationMs`).
2. **Métricas de Performance (Prometheus + Grafana):** Coleta periódica de métricas de aplicação e infraestrutura (`http_requests_total`, `http_request_duration_seconds`, `db_pool_connections_active`, `bullmq_jobs_waiting`).
3. **Instrumentação de Traces (OpenTelemetry):** Instrumentação nativa da aplicação preparando dados de contexto para propagação do Correlation ID. *(Nota: Armazenamento persistente de traces via Grafana Tempo é mantido como evolução futura)*.

---

## 2. Objetivos de Nível de Serviço (SLI / SLO)

Em conformidade com a declaração de infraestrutura em VPS única, os indicadores de confiabilidade (SLI) e metas (SLO) refletem métricas operacionais atingíveis:

| Categoria | Indicador SLI | Meta SLO Inicial | Janela Medição | Plano de Medição |
|---|---|---|---|---|
| **Disponibilidade API** | Requisições HTTP retornando status != 5xx | **99.5%** | 30 dias rolantes | Prometheus (`http_requests_total`) |
| **Latência HTTP Leitura (P95)**| Tempo de resposta de rotas GET | **< 250ms** | 7 dias | Prometheus Histogram |
| **Latência HTTP Escrita (P95)**| Tempo de resposta de rotas POST/PUT | **< 500ms** | 7 dias | Prometheus Histogram |
| **Latência PostgreSQL (P95)** | Tempo de execução de queries SQL | **< 100ms** | 7 dias | PostgreSQL `pg_stat_statements` |
| **Taxa de Erros de Infra** | Erros de infraestrutura / conexões perdidas| **< 0.5%** | 7 dias | Métricas Prometheus |
| **Sucesso de Jobs** | Taxa de jobs assíncronos concluídos sem DLQ | **99.0%** | 30 dias | Métricas BullMQ |

---

## 3. Matriz de Alertas e Notificações de Incidente

Os alertas são emitidos via Prometheus Alertmanager e integrados com webhooks do Discord/Slack e e-mail dos administradores:

| ID Alerta | Regra de Disparo | Severidade | Ação Imediata (Runbook) |
|---|---|---|---|
| **OBS-ALT-001**| Taxa de Erro HTTP 5xx > 1% por 5 minutos | **CRÍTICO** | Inspecionar logs no Loki e verificar banco/bordo. |
| **OBS-ALT-002**| Uso de CPU na VPS > 90% por 10 minutos | **ALERTA** | Identificar processo com uso anormal (ex: Ollama). |
| **OBS-ALT-003**| Espaço em Disco NVMe < 15% livre | **CRÍTICO** | Executar limpeza de logs e descarte de temp files. |
| **OBS-ALT-004**| Filas BullMQ em DLQ > 10 jobs falhos | **ALERTA** | Acessar painel de filas e verificar motivo de falha. |
| **OBS-ALT-005**| Conexões do Pool PostgreSQL > 85% | **ALERTA** | Verificar queries lentas e conexões presas. |
