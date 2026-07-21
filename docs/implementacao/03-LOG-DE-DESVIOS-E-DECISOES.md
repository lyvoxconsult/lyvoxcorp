---
title: Log de Desvios e Decisoes
date: 2026-07-21
phase: PHASE-000
---

# Log de desvios e decisoes

Nenhum documento canonico foi alterado.

| ID | Evidencia | Resolucao de implementacao | Impacto |
|---|---|---|---|
| DEV-0001 | DOC-13 usa `30s` e `45s` para timeout Ollama; JOB-004 usa `300s` | Separar timeout de chamada HTTP, timeout do provider e timeout total do job; congelar valor apenas na fase da integracao apos aplicar ADR/DOC-13 | Nao bloqueia fundacao |
| DEV-0002 | DOC-09 generaliza JSON para POST/PUT/PATCH; DOC-12 exige upload | Tratar upload como excecao `multipart/form-data` documentada no OpenAPI | Nao bloqueia fundacao |
| DEV-0003 | DOC-08 exige colunas-base, mas dicionarios parciais omitem campos | Regra geral de DOC-08 prevalece; schema completo sera derivado na fase de banco e rastreado | Nao bloqueia fundacao |
| DEV-0004 | Chave de sessao abreviada diverge da convencao Redis ambiental | Usar namespace ambiental completo; exemplo curto e nao normativo | Nao bloqueia fundacao |
| DEV-0005 | Matriz RBAC nao cobre todas as permissoes usadas nas APIs | Derivar seed somente da matriz canonica completa e aplicar deny-by-default; lacunas ficam negadas ate regra rastreada | Nao bloqueia bootstrap; bloqueia alegar RBAC completo |
| DEV-0006 | DOC-17 usa `GATE-DOC-016`, inexistente no roadmap | Preservar como defeito de referencia; nao remapear silenciosamente para `GATE-016` | Requer criterio consolidado de testes antes do gate funcional |
| DEV-0007 | DOC-17 e DOC-19 nao possuem fase proprietaria explicita no roadmap | Aplicar estrategia de testes transversalmente e validar backup/restore nos gates operacionais e finais | Nao bloqueia fundacao |
| DEV-0008 | Runbook de restore mistura pgBackRest/PITR e dump logico/pg_restore | Implementar runbooks distintos; nao declarar RPO/RTO aprovado sem drill real | Bloqueia producao, nao desenvolvimento local |
| DEV-0009 | Pipeline DOC-20 nao lista toda a matriz obrigatoria do DOC-17 | CI final deve incluir gates proporcionais de coverage, E2E, seguranca e performance conforme DOC-17 | Nao bloqueia fundacao |
| DEV-0010 | Prompt mestre classifica `FR-062` fora do escopo, enquanto DOC-02 descreve aprovacao interna e exclui apenas assinatura externa | Precedencia do prompt mestre: `FR-062 = OUT_OF_SCOPE_INITIAL`; nao implementar silenciosamente | Requer rastreabilidade explicita |
| DEV-0011 | Git iniciou sujo por alteracoes preexistentes do usuario | Preservar e excluir essas alteracoes dos commits da implementacao | Gate avalia integralidade dos arquivos de implementacao sem apropriar mudancas do usuario |
| DEV-0012 | Vault obrigatorio `D:\Obsidian\obsidian` inexistente | Persistir estado no repositorio; atualizar vault quando estiver disponivel, sem inventar caminho alternativo | Pendencia documental externa |
| DEV-0013 | DOC-22 usa `NOT_APPLICABLE_INITIAL`; DOC-27 e prompt usam `OUT_OF_SCOPE_INITIAL` | Normalizar apenas no registro de implementacao para `OUT_OF_SCOPE_INITIAL`; nao editar a matriz canonica | Mecanico, nao bloqueante |
| DEV-0014 | DOC-22 declara 56/56 FRs com fase/gate, mas FR-062 e FR-073 usam `N/A` | Contagem operacional correta: 54/56 com fase e gate; 2 fora do escopo | Mecanico, nao bloqueante |
| DEV-0015 | PHASE-010..030 em DOC-21 omitem campos formais de entregaveis/testes em varios blocos | Usar DOC-02, DOC-22, documento especializado e checklist DOC-27 para formar cada gate, sem criar novo planejamento | Exige consolidacao por fase |
| DEV-0016 | DOC-22 mapeia Dashboard a PHASE-009 e Configuracoes a PHASE-018 | Matriz nao altera requisito/roadmap; nao declarar comportamento funcional entregue pela fase de fundacao ou notificacoes | Nao permitir gate falso |
| DEV-0017 | DOC-25 inclui `docker system prune -a --volumes -f` sem inventario ou preview | Comando destrutivo nao sera executado; futuro runbook usara limpeza direcionada e verificavel | Risco alto evitado |
| DEV-0018 | DOC-27/DOC-28 certificam zero divergencias, mas auditoria encontrou inconsistencias mecanicas | Readiness fisica e intencao canonica permanecem validas; divergencias ficam abertas ate o gate afetado | GATE-000 pode aprovar com log explicito |
| DEV-0019 | DOC-21 PHASE-001 pede novo repositorio separado; prompt mestre declara este repo como canonico e proibe novo remoto, `git init` e apagar historico | Precedencia do prompt: preservar repo, remoto e historico atuais; PHASE-001 passa a validar Git e adicionar a fundacao neste PROJECT_ROOT | Resolve conflito antes da execucao |
| DEV-0020 | DOC-21 exige `LICENSE`, mas os documentos nao escolhem uma licenca | Criar aviso neutro sem concessao open source; termos definitivos permanecem decisao juridica futura | Evita inventar licenca |
| DEV-0021 | Host usa Node 24 e pnpm 11.9.0, mas DOC-07 fixa Node 20 LTS e pnpm 11 requer Node >=22.13 | Fixar Node 20.20.2, `engines` estrito e pnpm 10.34.5 compativel; validar o gate com runtime oficial Node 20 isolado | Resolve incompatibilidade sem alterar stack canonica |
| DEV-0022 | Turbo resolveu inicialmente o `pnpm` global 11 nos processos filhos apesar do comando raiz usar Corepack pnpm 10 | Habilitar o shim Corepack pnpm 10.34.5 no runtime isolado antes da validacao; manter `packageManager` e engines como fonte versionada | Primeira execucao falhou honestamente; repeticao canonica aprovou os tres workspaces |
