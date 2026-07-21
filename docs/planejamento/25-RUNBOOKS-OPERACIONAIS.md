# 25 — Runbooks Operacionais

- **Documento ID:** DOC-25
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (SRE & Operations Lead)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md), [19-BACKUP-RESTORE-DR-E-CONTINUIDADE.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/19-BACKUP-RESTORE-DR-E-CONTINUIDADE.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, SRE Operational Runbooks Standard

---

## 1. Índice de Runbooks Operacionais (OPS-ID)

Este documento especifica os procedimentos operacionais de emergência e manutenção para a equipe de SRE e administração da infraestrutura VPS do **Lyvox Gerenciamento**.

---

## 2. Especificação Detalhada dos Runbooks

### OPS-001: Indisponibilidade do Banco de Dados PostgreSQL
- **Sintoma:** Endpoints HTTP retornam erro 500, endpoint `/readiness` indica falha no banco de dados.
- **Impacto:** Alto (Parada total das operações de escrita e leitura).
- **Pré-requisitos:** Acesso SSH à VPS.
- **Diagnóstico:** Verificar o status do contêiner `docker ps | grep pgbouncer` e inspecionar logs `docker logs lyvox-postgres --tail 100`.
- **Ação:**
  1. Tentar restart gracioso do contêiner PgBouncer e PostgreSQL:
     ```bash
     docker compose restart pgbouncer postgres
     ```
  2. Verificar integridade de disco (`df -h`).
- **Validação:** Acessar `/readiness` e confirmar retorno `HTTP 200 OK`.
- **Escalonamento:** Se o banco estiver corrompido, acionar **RUNBOOK OPS-004 (Restore de Backup)**.

---

### OPS-002: Disco da VPS Cheio (Disk Full > 95%)
- **Sintoma:** Erros de I/O no PostgreSQL, contêineres parando por falha de gravação.
- **Impacto:** Alto.
- **Diagnóstico:** Executar `df -h` e `du -sh /var/lib/docker/*` para identificar o diretório ofensor.
- **Ação:**
  1. Limpar logs do Docker e imagens antigas não utilizadas:
     ```bash
     docker system prune -a --volumes -f
     ```
  2. Limpar logs antigos acumulados do Pino/Loki.
- **Validação:** Confirmar que o disco liberou pelo menos 20% de espaço livre.

---

### OPS-003: Indisponibilidade do Motor de IA Local (Ollama Down)
- **Sintoma:** Painel de IA indica "Serviço Indisponível", transcrições de reuniões não são geradas.
- **Impacto:** Baixo (O sistema principal continua 100% operacional sem IA).
- **Diagnóstico:** Verificar contêiner Ollama: `docker logs lyvox-ollama --tail 50`.
- **Ação:**
  ```bash
  docker compose restart ollama
  ```
- **Validação:** Testar requisição simples na API HTTP do Ollama (`curl http://localhost:11434/api/version`).

---

### OPS-004: Perda Total da VPS e Restauração de Emergência (Disaster Recovery)
- **Sintoma:** Servidor VPS inacessível na rede, host físico inoperante.
- **Impacto:** Crítico (RTO 4h / RPO 1h).
- **Ação:** Seguir rigorosamente o **Runbook de Restore do Documento DOC-19 (Seção 4)**:
  1. Provisionar nova VPS Ubuntu.
  2. Importar chaves GPG e baixar backups offsite.
  3. Restaurar PostgreSQL via `pg_restore`.
  4. Restaurar volume de arquivos privados.
  5. Subir Docker Compose e redirecionar DNS.
- **Validação:** Executar suíte de testes de fumaça (Smoke Tests) em produção.
