---
title: Bloqueios e Pendencias
date: 2026-07-22
phase: PHASE-009
---

# Bloqueios e pendencias

## HARD_BLOCKER atual

Nenhum para validacao documental ou desenvolvimento local.

## Pendencias controladas

| Item | Quando bloqueia | Tratamento |
|---|---|---|
| Vault `D:\Obsidian\obsidian` ausente | Sincronizacao do segundo cerebro | Manter registro no repo e sincronizar quando o vault existir |
| Mobbin MCP indisponivel | Consulta de referencia visual real | Aplicar DOC-04; registrar limitacao; nao bloquear UI |
| Credenciais DNS/VPS/GHCR/SMTP/n8n/Ollama/S3/alertas nao validadas | Staging, producao, integracoes ou DR reais | Nao bloqueiam local; validar no gate correspondente |
| Worktree preexistente sujo | Criterio literal de Git limpo | Nao apropriar mudancas do usuario; commits usam pathspec apenas dos artefatos da implementacao |
| Lacunas DEV-0001..DEV-0056 | Gates especificos | Resolver por precedencia e testes antes de declarar gate afetado |
| Vulnerabilidade moderada transitiva do `drizzle-kit` | Uso do servidor de desenvolvimento vulneravel ou promocao do tooling ao runtime | Servidor nao usado; dependencia apenas de desenvolvimento; acompanhar upgrade conforme DEV-0028 |
| Termos juridicos definitivos da licenca | Distribuicao externa do software | `LICENSE` nao concede licenca; titular deve aprovar termos antes de distribuicao |
| Node 20 esta fora de manutencao em 2026 | Producao segura de longo prazo | Seguir DOC-07 nesta implementacao; upgrade de major exige ADR autorizado antes da operacao prolongada |
| FR-006 depende de convite/lifecycle e entrega por e-mail | Declarar gestao de usuarios completa | Listagem e `users.manage` estao protegidos; manter FR parcial ate convite, edicao, suspensao e reativacao reais conforme DEV-0045 |
| Entrega real de e-mail do reset depende de JOB-001 | Declarar FR-003 E2E completo | Implementar token/outbox agora; validar worker e SMTP no gate proprietario, conforme DEV-0033 |
