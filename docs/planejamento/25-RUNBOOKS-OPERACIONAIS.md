# 25 — Runbooks Operacionais

- **Documento ID:** DOC-25
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (SRE & Operations Lead)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md](./14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md), [19-BACKUP-RESTORE-DR-E-CONTINUIDADE.md](./19-BACKUP-RESTORE-DR-E-CONTINUIDADE.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, SRE Operational Runbooks Standard

---

## 1. Índice de Runbooks Operacionais (OPS-ID)

Este documento especifica os procedimentos operacionais de emergência e manutenção para a infraestrutura VPS do **Lyvox Gerenciamento**.

---

## 2. Especificação Detalhada dos Runbooks

### OPS-001: Indisponibilidade do Banco de Dados PostgreSQL
- **Sintoma:** Endpoints HTTP retornam erro 500, `/readiness` indica falha no banco de dados.
- **Impacto:** Alto (Parada de operações de leitura e escrita).
- **Pré-requisitos:** Acesso SSH à VPS.
- **Diagnóstico:** Inspecionar `docker ps | grep pgbouncer` e logs `docker logs lyvox-postgres --tail 100`.
- **Ação:**
  1. Restart gracioso dos contêineres:
     ```bash
     docker compose restart pgbouncer postgres
     ```
  2. Verificar integridade de disco (`df -h`).
- **Validação:** Acessar `/readiness` e confirmar retorno `HTTP 200 OK`.
- **Escalonamento:** Se houver corrupção, acionar **RUNBOOK OPS-004 (Restore de Disaster Recovery)**.

---

### OPS-002: Disco da VPS Cheio (Disk Full > 95%)
- **Sintoma:** Erros de I/O no PostgreSQL, contêineres parando por falha de gravação.
- **Impacto:** Alto.
- **Diagnóstico:** Executar `df -h` e `du -sh /var/lib/docker/*`.
- **Ação:**
  1. Limpar imagens e volumes não utilizados:
     ```bash
     docker system prune -a --volumes -f
     ```
  2. Limpar logs antigos acumulados no Loki.
- **Validação:** Confirmar que o disco liberou no mínimo 20% de espaço livre.

---

### OPS-003: Indisponibilidade do Motor de IA Local (Ollama Down)
- **Sintoma:** Painel de IA indica "Serviço Indisponível".
- **Impacto:** Baixo (O sistema operacional principal continua 100% funcional sem IA).
- **Diagnóstico:** Verificar contêiner Ollama: `docker logs lyvox-ollama --tail 50`.
- **Ação:**
  ```bash
  docker compose restart ollama
  ```
- **Validação:** Testar requisição HTTP na API do Ollama (`curl http://localhost:11434/api/version`).

---

### OPS-004: Perda Total da VPS e Restauração de Emergência (Disaster Recovery)
- **Sintoma:** Servidor VPS inacessível na rede, host físico inoperante.
- **Impacto:** Crítico (RTO 4h / RPO 1h).
- **Ação:** Seguir o **Runbook de Restore do Documento DOC-19 (Seção 4)**:
  1. Provisionar nova VPS Ubuntu.
  2. Importar chaves GPG e baixar backups offsite.
  3. Restaurar PostgreSQL via `pg_restore`.
  4. Restaurar volume de arquivos privados em `/var/lib/lyvox/storage/`.
  5. Subir Docker Compose e redirecionar DNS.
- **Validação:** Executar suíte de testes de fumaça (*Smoke Tests*).

---

### OPS-005: Falha no Envio de E-mails Transacionais (SMTP Failure)
- **Sintoma:** Usuários não recebem e-mails de redefinição de senha ou convites.
- **Impacto:** Médio.
- **Diagnóstico:** Inspecionar a fila `emails` no Bull-Board e validar a conectividade com o host SMTP.
- **Ação:** Testar a credencial SMTP e acionar o *replay* dos jobs na DLQ do Bull-Board após a correção.
