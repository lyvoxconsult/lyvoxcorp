# PROMPT MESTRE NEUTRO — CONCLUIR INTEGRALMENTE O LYVOX GERENCIAMENTO

## 0. NATUREZA DESTA INSTRUÇÃO

Esta é a instrução única de retomada, execução, validação, implantação e conclusão do projeto **Lyvox Gerenciamento**.

Ela foi escrita de forma neutra em relação ao ambiente executor.

Pode ser utilizada por qualquer agente de engenharia capaz de trabalhar no repositório, independentemente da IDE, aplicação, terminal, extensão ou plataforma utilizada.

Neste documento, o termo:

```text
AGENTE EXECUTOR
```

refere-se ao agente atualmente responsável pelo trabalho.

Não presuma uma ferramenta específica.

Não dependa de recursos exclusivos de uma IDE.

Quando uma capacidade citada não estiver disponível, use uma alternativa tecnicamente equivalente.

Exemplos:

```text
subagentes indisponíveis → executar revisões sequenciais com contextos separados
MCP indisponível → usar documentação oficial ou ferramenta equivalente
navegador integrado indisponível → usar Playwright pela CLI
interface GitHub indisponível → usar git e gh pela linha de comando
Docker Desktop indisponível → usar Docker Engine equivalente
```

A ausência de uma ferramenta opcional não é motivo para interromper o projeto.

---

# 1. MISSÃO

Sua missão é retomar o estado existente do Lyvox Gerenciamento e concluir integralmente o projeto.

Isso inclui:

```text
reconciliar o estado local com o repositório remoto
validar e certificar a PHASE-011 já implementada
continuar da PHASE-012 até a PHASE-030
implementar todos os requisitos em escopo
manter rastreabilidade
executar testes
executar revisões independentes
preparar e validar staging
implantar produção após os gates
executar estabilização
atualizar toda documentação
entregar o sistema operacional
```

Não reinicie o projeto.

Não crie outro planejamento.

Não reimplemente fases já aprovadas.

Não abandone o projeto após criar fundações ou telas parciais.

Não encerre enquanto houver fase obrigatória incompleta, salvo `HARD_BLOCKER` externo real.

---

# 2. REPOSITÓRIO CANÔNICO

```text
REPOSITORY = https://github.com/lyvoxconsult/lyvoxcorp.git
DEFAULT_BRANCH = main
```

Referências remotas verificadas antes desta instrução:

```text
VERIFIED_REMOTE_MAIN = d7b7092a264b6b8e5480ae0fa3412d6711aab522
VERIFIED_PHASE_011_COMMIT = 01a28935f9328225d9bbfd08a7073b873fdab198
VERIFIED_PHASE_011_MESSAGE = feat(crm): implement leads and crm module (PHASE-011)
VERIFIED_MERGED_PR = #1
```

Esses SHAs são âncoras históricas.

O estado remoto pode ter avançado depois da criação deste prompt.

Portanto:

```text
origin/main atual tem precedência quando for descendente legítimo dessas referências
```

Não force o repositório a voltar aos SHAs acima.

Não reescreva histórico remoto.

---

# 3. ESTADO CONHECIDO DO PROJETO

Estado consolidado:

```text
PHASE-000..PHASE-010 = APPROVED
GATE-000..GATE-010 = APPROVED
PHASE-011_CODE = PRESENT_ON_REMOTE_MAIN
PHASE-011_REMOTE_COMMIT = 01a28935f9328225d9bbfd08a7073b873fdab198
PHASE-011_DOCUMENTATION = POSSIBLY_STALE
GATE-011 = REQUIRES_RECONCILIATION_AND_REVALIDATION
NEXT_PHASE_AFTER_GATE_011 = PHASE-012
```

O código da PHASE-011 já inclui, no mínimo:

```text
migrations/0005_crm_domain.sql
módulo backend CRM
frontend CRM
schemas de validação
permissões crm.*
pipeline de leads
follow-ups
cadências
importação
conversão em cliente
```

Não reimplemente a PHASE-011 do zero.

Não crie outra migration inicial para o mesmo domínio.

Primeiro audite o que já existe.

---

# 4. FONTES CANÔNICAS

A documentação canônica está em:

```text
docs/planejamento/
```

A documentação de execução está em:

```text
docs/implementacao/
```

O arquivo:

```text
docs/planejamento/21-ROADMAP-DE-IMPLEMENTACAO-PARA-CODEX.md
```

tem nome histórico, mas seu conteúdo deve ser interpretado como roadmap para o **AGENTE EXECUTOR**, independentemente da ferramenta utilizada.

O mesmo se aplica a qualquer documento que mencione o nome de outro agente.

A identidade do executor não altera:

```text
requisitos
ADRs
arquitetura
stack
gates
critérios de aceite
```

---

# 5. HIERARQUIA DE PRECEDÊNCIA

Quando houver contradição, use:

```text
1. Este prompt de execução
2. DOC-23 — ADRs
3. DOC-01 — visão, escopo e princípios
4. DOC-02 — requisitos e regras de negócio
5. Documento especializado do domínio
6. DOC-22 — matriz de rastreabilidade
7. DOC-21 — roadmap
8. DOC-26 — handoff
9. DOC-27 — checklist
10. Registros de implementação
11. Comentários ou mensagens anteriores de agentes
```

Regras:

```text
uma matriz não altera um requisito
um roadmap não altera um ADR
um teste não redefine uma regra de negócio
um exemplo de payload não amplia o escopo
um relatório antigo não supera o código e as evidências atuais
```

---

# 6. PROIBIÇÃO DE LEGADO

É proibido:

```text
acessar o projeto antigo
copiar código legado
copiar migrations legadas
copiar schema legado
copiar componentes legados
consultar Supabase legado
copiar credenciais legadas
migrar dados de teste legados
```

O trabalho deve usar exclusivamente:

```text
repositório lyvoxcorp
docs/planejamento/
docs/implementacao/
estado local e remoto atual
```

---

# 7. REGRAS CONTRA ALUCINAÇÃO

Não invente:

```text
módulos
telas
regras
campos
permissões
provedores
integrações
APIs
estados
cargos
workflows
requisitos legais
requisitos contábeis
```

Toda função implementada deve ser rastreável a:

```text
FR-ID
BR-ID
SEC-ID
NFR-ID
OPS-ID
```

Detalhes técnicos podem ser decididos autonomamente somente quando:

```text
não alterarem o produto
não alterarem ADR
forem reversíveis
não ampliarem escopo
forem documentados
```

Quando não houver solução válida:

```text
NO_VALID_SOLUTION_FOUND
```

Registre o motivo.

Não simule conclusão.

---

# 8. AUTONOMIA E PERGUNTAS

Não faça perguntas durante a execução normal.

Não pergunte se deve continuar.

Não peça aprovação ao final de cada fase.

Não interrompa após emitir um relatório de fase.

Depois de um gate aprovado:

```text
avance automaticamente
```

Interrompa apenas por `HARD_BLOCKER`.

É `HARD_BLOCKER` somente:

```text
credencial externa indispensável no gate atual
permissão negada que impeça operação
risco de destruição de dados reais
inconsistência de produto irreversível
infraestrutura obrigatória fisicamente indisponível
decisão não documentada que altere produto ou contrato
```

Não são `HARD_BLOCKER`:

```text
skill indisponível
MCP indisponível
subagente indisponível
IDE diferente
ausência de Obsidian
ausência de ferramenta visual
credencial de produção durante fase local
integração externa pertencente a fase futura
```

---

# 9. PROTEÇÃO DO GIT E DO WORKTREE

É proibido executar:

```text
git reset --hard
git clean -fd
git clean -fdx
git restore .
git checkout -- .
git stash drop
git stash clear
git push --force
git push --force-with-lease
rebase destrutivo
```

Não descarte:

```text
arquivos modificados
arquivos staged
arquivos não rastreados
mudanças do usuário
```

Não faça stash automático sem:

```text
inventário
hash
pathspec explícito
justificativa
restauração verificada
```

Preferência:

```text
preservar alterações e trabalhar com commits/pathspecs atômicos
```

---

# 10. PROTOCOLO INICIAL DE RETOMADA

Antes de alterar qualquer arquivo:

## 10.1 Ler documentos

Leia integralmente:

```text
PROMPT-MESTRE-CODEX_IMPLEMENTACAO-INTEGRAL-LYVOX-GERENCIAMENTO.md, quando existir

docs/planejamento/00-INDICE-MESTRE-E-STATUS.md
docs/planejamento/01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md
docs/planejamento/02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md
docs/planejamento/03-ARQUITETURA-DE-INFORMACAO-TELAS-E-NAVEGACAO.md
docs/planejamento/04-UX-DESIGN-SYSTEM-E-ACESSIBILIDADE.md
docs/planejamento/05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md
docs/planejamento/06-ARQUITETURA-FRONTEND.md
docs/planejamento/07-ARQUITETURA-BACKEND.md
docs/planejamento/08-MODELAGEM-POSTGRESQL-E-DICIONARIO-DE-DADOS.md
docs/planejamento/09-CONTRATOS-API-REST-E-OPENAPI.md
docs/planejamento/10-AUTENTICACAO-RBAC-E-SEGURANCA.md
docs/planejamento/11-CACHE-FILAS-WORKERS-E-JOBS.md
docs/planejamento/12-ARQUIVOS-DOCUMENTOS-E-STORAGE.md
docs/planejamento/13-INTEGRACOES-N8N-IA-E-SERVICOS-EXTERNOS.md
docs/planejamento/14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md
docs/planejamento/15-OBSERVABILIDADE-SRE-SLI-SLO-E-ALERTAS.md
docs/planejamento/16-PERFORMANCE-CAPACIDADE-E-ESCALABILIDADE.md
docs/planejamento/17-ESTRATEGIA-DE-TESTES-QA-E-HOMOLOGACAO.md
docs/planejamento/18-AMBIENTES-CONFIGURACOES-SEEDS-E-BOOTSTRAP.md
docs/planejamento/19-BACKUP-RESTORE-DR-E-CONTINUIDADE.md
docs/planejamento/20-CI-CD-VERSIONAMENTO-RELEASE-E-ROLLBACK.md
docs/planejamento/21-ROADMAP-DE-IMPLEMENTACAO-PARA-CODEX.md
docs/planejamento/22-MATRIZ-DE-RASTREABILIDADE.md
docs/planejamento/23-ADRS-DECISOES-ARQUITETURAIS.md
docs/planejamento/24-RISCOS-PREMISSAS-LACUNAS-E-DECISOES-BLOQUEADAS.md
docs/planejamento/25-RUNBOOKS-OPERACIONAIS.md
docs/planejamento/26-HANDOFF-EXECUTIVO-PARA-CODEX.md
docs/planejamento/27-CHECKLIST-MESTRE-DE-ACEITE.md
docs/planejamento/28-RELATORIO-FINAL-DE-CONSISTENCIA.md

docs/implementacao/00-ESTADO-DA-EXECUCAO.md
docs/implementacao/02-LOG-DE-FASES.md
docs/implementacao/03-LOG-DE-DESVIOS-E-DECISOES.md
docs/implementacao/04-RASTREABILIDADE-IMPLEMENTADA.md
docs/implementacao/05-EVIDENCIAS-DE-TESTES.md
docs/implementacao/06-BLOQUEIOS-E-PENDENCIAS.md
docs/implementacao/07-REGISTRO-DE-RELEASES.md
docs/implementacao/08-RELATORIO-FINAL-DE-IMPLEMENTACAO.md
```

## 10.2 Inspecionar Git

Execute:

```powershell
git status --short
git branch --show-current
git remote -v
git log --oneline --decorate --graph -30
git diff --check
git diff --cached --check
git diff --cached --stat
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
```

Registre:

```text
LOCAL_BRANCH
LOCAL_HEAD
REMOTE_MAIN_HEAD
MODIFIED_FILES
STAGED_FILES
UNTRACKED_FILES
LOCAL_AHEAD
LOCAL_BEHIND
```

## 10.3 Sincronizar sem destruição

Se o worktree estiver limpo e for possível fast-forward:

```powershell
git switch main
git pull --ff-only origin main
```

Se estiver sujo:

```text
não trocar branch
não fazer pull
não fazer reset
não fazer stash automático
```

Catalogue cada alteração e reconcilie com:

```text
origin/main
último commit local
último registro em docs/implementacao/
```

---

# 11. PERSISTÊNCIA DE CONTEXTO

Mantenha atualizados:

```text
docs/implementacao/00-ESTADO-DA-EXECUCAO.md
docs/implementacao/02-LOG-DE-FASES.md
docs/implementacao/03-LOG-DE-DESVIOS-E-DECISOES.md
docs/implementacao/04-RASTREABILIDADE-IMPLEMENTADA.md
docs/implementacao/05-EVIDENCIAS-DE-TESTES.md
docs/implementacao/06-BLOQUEIOS-E-PENDENCIAS.md
docs/implementacao/07-REGISTRO-DE-RELEASES.md
docs/implementacao/08-RELATORIO-FINAL-DE-IMPLEMENTACAO.md
```

`00-ESTADO-DA-EXECUCAO.md` deve conter:

```text
fase atual
última fase aprovada
gate atual
branch
commit local
origin/main
migrations
serviços
testes
FRs implementados
FRs parciais
FRs pendentes
bloqueios
próxima ação exata
```

Antes de:

```text
compactação de contexto
limite de tokens
encerramento da aplicação
reinício da máquina
troca de agente
```

persista o estado.

Uma futura sessão deve conseguir retomar lendo apenas o repositório.

---

# 12. RECONCILIAR E CERTIFICAR A PHASE-011

## 12.1 Não reimplementar

O commit remoto:

```text
01a28935f9328225d9bbfd08a7073b873fdab198
```

já implementa a PHASE-011.

Audite o commit e o estado atual.

Não crie duplicação.

## 12.2 Validar o escopo

Validar:

```text
FR-030
FR-031
FR-032
FR-033
BRs relacionados
API-021
API-022
DB-030
TEST-005
GATE-011
```

Confirmar:

```text
pipeline
Kanban
etapas personalizáveis
origens
responsável
notas
histórico
follow-ups
templates
cadências
importação CSV
conversão em cliente
métricas
```

Integrações de fases futuras devem permanecer parciais.

## 12.3 Migration CRM

Validar:

```text
migrations/0005_crm_domain.sql
snapshot anterior inalterado
snapshot novo encadeado
journal
drizzle-kit check
aplicação
segunda execução idempotente
constraints
FKs
índices
backfill
sem perda de dados
```

## 12.4 Backend CRM

Testar:

```text
criação
duplicidade
listagem
busca
filtros
cursor
mudança de etapa
histórico
follow-up
cadência
importação
conversão
ownership
cross-owner
IDOR
CSRF
idempotência
concorrência
SQL injection literal
soft delete
auditoria
OpenAPI
```

## 12.5 Frontend CRM

Testar:

```text
Kanban
lista
formulário
importação
follow-ups
cadências
responsáveis
filtros
loading
empty
error
permissões
API real
drag and drop acessível
teclado
```

Browser:

```text
1440px
768px
390px
```

Critérios:

```text
zero overflow
zero erro inesperado
zero botão falso
zero link quebrado
foco correto
ARIA correta
```

## 12.6 Revisões do GATE-011

Executar revisões sequenciais:

```text
SPEC/ARCH
SECURITY/QUALITY
QA FINAL
```

Quando subagentes estiverem disponíveis, use revisores independentes.

Quando não estiverem:

```text
execute revisões em passes separados
limpe o contexto de implementação entre os passes
use checklists independentes
```

## 12.7 Certificação

Se aprovado:

```text
PHASE-011 = APPROVED
GATE-011 = APPROVED
CURRENT_PHASE = PHASE-012
CURRENT_GATE = GATE-012
```

Atualizar rastreabilidade de:

```text
FR-030
FR-031
FR-032
FR-033
```

Não marcar dependência externa futura como concluída.

Criar commit:

```text
docs(implementation): certify phase 011 gate
```

Correções comprovadas, quando necessárias:

```text
fix(crm): <descrição>
docs(implementation): certify phase 011 gate
```

---

# 13. LOOP OBRIGATÓRIO PARA TODAS AS FASES

Para cada fase restante:

## 13.1 Preparação

```text
ler a fase
ler FRs
ler BRs
ler APIs
ler DBs
ler permissões
ler testes
ler ADRs
identificar dependências
definir arquivos a alterar
definir riscos
```

## 13.2 Implementação

```text
implementar somente o escopo
usar contratos tipados
criar migration incremental
implementar testes junto
atualizar OpenAPI
atualizar rastreabilidade
documentar decisões
```

## 13.3 Validação focal

Executar primeiro testes focalizados.

Corrigir até verde.

## 13.4 Validação integrada

Executar:

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm build
pnpm test
pnpm dev:verify
pnpm audit --audit-level high
```

Adicionar conforme a fase:

```text
migration tests
integration tests
E2E
Playwright
accessibility
security
load
backup restore
```

## 13.5 QA independente

Três passes:

```text
1. SPEC/ARCH
2. SECURITY/QUALITY
3. QA FINAL
```

Achado material:

```text
rejeitar gate
corrigir
repetir o passe
```

## 13.6 Gate

Aprovar somente quando:

```text
entregáveis existem
testes passam
aceite passa
documentação atualizada
rastreabilidade atualizada
sem blocker crítico
sem secret
sem alteração canônica indevida
commit atômico preparado
```

## 13.7 Continuação

```text
commit
push
PR/merge quando aplicável
atualizar estado
avançar automaticamente
```

---

# 14. PHASE-012 — REUNIÕES

Implementar:

```text
agenda interna
criação
edição
cancelamento
status
participantes
pauta
notas
anexos
transcrição enviada
análise por IA enfileirada
tarefas originadas
vínculo com cliente
vínculo com lead
vínculo futuro com proposta/projeto
timeline de cliente
```

Não implementar Google Calendar.

Validar:

```text
timezone
conflito de horário
permissão
ownership
anexos
arquivo malicioso
transcrição
modo sem IA
auditoria
mobile
```

Gate:

```text
GATE-012
```

---

# 15. PHASE-013 — SERVIÇOS E PREÇOS

Implementar:

```text
categorias
serviços
descrição
unidade de cobrança
pontual
recorrente
preço
moeda
vigência
versionamento
status
arquivamento
busca
filtros
```

Garantir:

```text
propostas antigas preservam preço histórico
alteração de preço gera versão
dinheiro usa precisão decimal
RBAC
auditoria
```

Gate:

```text
GATE-013
```

---

# 16. PHASE-014 — PROPOSTAS E CONTRATOS

Implementar:

```text
propostas
itens
descontos
validade
condições
parcelamento
recorrência
versões
aprovação interna
status
PDF
exportação
conversão em contrato
cancelamento
histórico
vínculo financeiro
timeline do cliente
```

Não implementar:

```text
assinatura ICP-Brasil
portal externo
aceite jurídico garantido
```

Validar:

```text
cálculos
arredondamento
concorrência
versionamento
imutabilidade de versão aprovada
PDF real
download autorizado
auditoria
```

Gate:

```text
GATE-014
```

---

# 17. PHASE-015 — PROJETOS E TAREFAS

Implementar:

```text
projetos
membros
responsáveis
status
prioridade
datas
orçamento de referência
tarefas
subtarefas parent_task_id
comentários
anexos
atividade
lista
Kanban
calendário
Gantt
filtros
indicadores
```

Não implementar timesheet avançado.

Validar:

```text
dependências de data
ownership
assignee
cross-assignee
drag and drop
teclado
Gantt responsivo
subtarefas cíclicas
auditoria
```

Gate:

```text
GATE-015
```

---

# 18. PHASE-016 — FINANCEIRO

Implementar:

```text
receitas
despesas
contas a receber
contas a pagar
categorias
centros de custo
contas/caixas
competência
vencimento
pagamento
parcelamento
recorrência
baixa
estorno
vínculos
fluxo de caixa
relatórios gerenciais
auditoria
```

Não implementar:

```text
banco
Open Finance
boleto
PIX automático
emissão fiscal
contabilidade oficial
DRE oficial
```

Integridade obrigatória:

```text
transações atômicas
idempotência
locks
optimistic concurrency
decimal
estorno auditável
sem duplicação de baixa
```

Gate:

```text
GATE-016
```

---

# 19. PHASE-017 — MARKETING

Implementar:

```text
ideias
calendário editorial
posts
campanhas
kit de marca
geração assistida por IA
revisão
status
exportação
```

Não publicar diretamente em redes sociais.

Validar:

```text
modo sem IA
versionamento de prompt
privacidade
fila
cancelamento
exportação
acessibilidade
```

Gate:

```text
GATE-017
```

---

# 20. PHASE-018 — NOTIFICAÇÕES, E-MAIL E CONFIGURAÇÕES

Implementar:

```text
notificações internas
lida/não lida
prioridade
link contextual
preferências
e-mails transacionais
configurações da empresa
branding
parâmetros
segurança
integrações
IA
storage
```

Completar dependências:

```text
FR-003 reset por e-mail
FR-006 convite e lifecycle de usuários
```

Desenvolvimento:

```text
Mailpit
```

Produção:

```text
SMTP configurável
```

Gate:

```text
GATE-018
```

---

# 21. PHASE-019 — ARQUIVOS E DOCUMENTOS

Implementar:

```text
filesystem privado abstrato
upload
download
streaming
metadados
checksum
magic bytes
MIME
tamanho
nome seguro
versionamento
vínculos
retenção
exclusão
restauração
PDF
imagens
documentos
```

Proibir:

```text
URL pública direta
path traversal
execução de arquivo
confiança só na extensão
```

Gate:

```text
GATE-019
```

---

# 22. PHASE-020 — FILAS E AUTOMAÇÕES

Implementar:

```text
BullMQ
worker separado
emails
notifications
documents
reports
automation
maintenance
retries
backoff
DLQ
idempotência
timeout
retenção
replay
métricas
```

Implementar engine de automação:

```text
trigger
condições
ações
versões
ativação
execução manual
agendamento
histórico
falhas
```

Regra crítica continua no backend.

Gate:

```text
GATE-020
```

---

# 23. PHASE-021 — N8N

Implementar:

```text
transactional outbox
webhook HMAC
timestamp
nonce
idempotência
correlation ID
timeout
retry
circuit breaker
callback inbox
auditoria
```

Proibir acesso direto do n8n ao banco.

Se credencial real estiver ausente:

```text
implementar contrato completo
testar com servidor compatível local
preparar configuração
registrar HARD_BLOCKER somente para homologação externa
```

Gate:

```text
GATE-021
```

---

# 24. PHASE-022 — IA LOCAL

Implementar:

```text
provider abstraction
Ollama
fila
worker
limites
timeout
cancelamento
status
histórico
prompt versioning
validação de saída
auditoria
privacidade
modo degradado
```

Sem fallback pago automático.

Sistema deve funcionar sem IA.

Gate:

```text
GATE-022
```

---

# 25. PHASE-023 — AUDITORIA

Completar:

```text
audit_logs imutável
login
logout
falha de login
usuários
cargos
permissões
clientes
CRM
reuniões
propostas
contratos
financeiro
automações
arquivos
exportações
administração
```

Validar:

```text
append-only
redaction
integridade
filtros
retenção
acesso audit.read
```

Gate:

```text
GATE-023
```

---

# 26. PHASE-024 — OBSERVABILIDADE

Implementar:

```text
Pino JSON
correlation ID
Prometheus
Grafana
Loki
OpenTelemetry instrumentation
dashboards
alertas
retenção
redaction
```

Métricas:

```text
API
latência
erros
PostgreSQL
PgBouncer
Redis
filas
workers
disco
arquivos
backup
auth
segurança
```

Tempo não é obrigatório na versão inicial.

Gate:

```text
GATE-024
```

---

# 27. PHASE-025 — HARDENING DE SEGURANÇA

Executar:

```text
dependency audit
secret scan
container scan
SAST
headers
CSP
HSTS
cookies
CSRF
Origin
SSRF
IDOR
upload
rate limit
brute force
RBAC
SQL injection
XSS
path traversal
supply chain
backup exposure
log exposure
```

Corrigir achados críticos e altos.

Documentar riscos residuais.

Gate:

```text
GATE-025
```

---

# 28. PHASE-026 — PERFORMANCE

Executar k6 em staging ou ambiente equivalente.

Cenários:

```text
login
dashboard
clientes
lead pipeline
tarefas
financeiro
upload
enqueue
```

Registrar:

```text
dataset
warm-up
duração
VUs
RPS
P50
P95
P99
erros
CPU
RAM
conexões
I/O
fila
```

Metas de referência:

```text
100 RPS sustentados
P95 leitura comum <= 250 ms
P95 escrita comum <= 500 ms
erro infra < 0,5%
```

Não falsificar resultado.

Se a VPS não atingir:

```text
identificar gargalo
otimizar
retestar
documentar capacidade real
```

Gate:

```text
GATE-026
```

---

# 29. PHASE-027 — STAGING

Implantar staging separado.

Validar:

```text
DNS
TLS
Caddy
cookies Secure
CSRF
PostgreSQL
PgBouncer
Redis
worker
filas
storage
n8n
Ollama
SMTP
observabilidade
backup
restore
load
smoke
E2E
RBAC
```

Usar:

```text
banco separado
volumes separados
secrets separados
domínio separado
compose project separado
```

Gate:

```text
GATE-027
```

---

# 30. PHASE-028 — HOMOLOGAÇÃO

Executar DOC-27 integralmente.

Validar:

```text
produto
UX
frontend
backend
banco
API
auth
RBAC
segurança
arquivos
filas
n8n
IA
financeiro
infra
observabilidade
performance
backup
CI/CD
deploy
documentação
```

Executar todos os botões, rotas e fluxos.

Zero botão fantasma.

Zero sucesso falso.

Gate:

```text
GATE-028
```

---

# 31. PHASE-029 — PRODUÇÃO

Esta instrução autoriza o deploy em produção somente quando:

```text
GATE-028 = APPROVED
backup verificado
restore verificado
rollback preparado
staging aprovado
secrets configurados
acesso à VPS confirmado
```

Executar:

```text
janela controlada
backup
migration expand/contract
imagem imutável
graceful shutdown
health
smoke
monitoramento
rollback se necessário
```

Não prometer zero downtime.

Não destruir serviços existentes:

```text
n8n
Qdrant
Ollama
```

Respeitar orçamento da VPS.

Gate:

```text
GATE-029
```

---

# 32. PHASE-030 — ESTABILIZAÇÃO

Executar hypercare.

Objetivo:

```text
monitoramento intensivo por até 72 horas
```

Se a plataforma não permitir trabalho contínuo em segundo plano:

```text
automatizar checks e alertas
documentar o início do período
persistir o estado
retomar nas execuções subsequentes
não fingir que 72 horas passaram
```

Monitorar:

```text
erros
latência
CPU
RAM
disco
PostgreSQL
Redis
filas
logs
auth
backup
serviços externos
```

Corrigir regressões.

Gate:

```text
GATE-030
```

---

# 33. FRONTEND — REGRAS TRANSVERSAIS

Usar:

```text
React 19
Vite
TypeScript
React Router
TanStack Query
Zustand somente UI
React Hook Form
Zod
```

Proibir no navegador:

```text
JWT
Bearer token
localStorage de sessão
sessionStorage de sessão
secret
permissão definitiva
regra crítica
acesso direto ao banco
```

Obrigatório:

```text
cookie HttpOnly
CSRF
error boundary
loading
skeleton
empty
error
responsive
WCAG 2.2 AA
teclado
foco
redução de movimento
```

Design:

```text
seguir DOC-04
não criar dashboard SaaS genérico
não alterar identidade visual sem decisão
```

---

# 34. BACKEND — REGRAS TRANSVERSAIS

Usar:

```text
NestJS
Fastify
TypeScript
modular monolith
domain
application
infrastructure
interfaces/http
```

Obrigatório:

```text
DTO/Zod
RFC 7807
correlation ID
logs estruturados
transactions
idempotency
audit
rate limit
graceful shutdown
health
readiness
OpenAPI
```

Proibir:

```text
regra crítica em controller
regra crítica só no frontend
regra crítica só no n8n
sucesso após exceção
catch que mascara falha
```

---

# 35. BANCO — REGRAS TRANSVERSAIS

Usar:

```text
PostgreSQL
Drizzle
migration incremental
```

Obrigatório:

```text
PK
FK
UNIQUE
CHECK
NOT NULL
índices
soft delete
version
UTC
decimal monetário
outbox
inbox
idempotência
```

Nunca editar migration aplicada em staging/produção.

Criar migration corretiva.

Testar:

```text
upgrade
idempotência
concorrência
rollback quando previsto
restore
```

---

# 36. AUTENTICAÇÃO E RBAC

Manter:

```text
sessão opaca
PostgreSQL autoritativo
Redis cache
cookie HttpOnly
Secure staging/prod
SameSite=Lax
Argon2id
TOTP
CSRF
Origin
revogação
logout global
deny by default
RBAC + ownership
```

Proibir bypass por nome de cargo.

Testar os cinco cargos:

```text
Administrador
Gestão
Financeiro
Comercial
Operacional
```

---

# 37. TESTES

Cada FR em escopo deve possuir teste.

Tipos:

```text
unit
component
integration
database
API
contract
RBAC
security
E2E
accessibility
responsive
load
failure
backup restore
```

Proibido:

```text
remover teste para passar
reduzir asserção sem justificativa
skip permanente
declarar sem executar
```

Evidência:

```text
comando
ambiente
resultado
duração
falha
correção
```

---

# 38. QA DE INTERFACE

Usar navegador real.

Auditar:

```text
rotas
menus
links
botões
modais
forms
filtros
tabelas
paginação
uploads
downloads
loading
empty
error
mobile
tablet
desktop
teclado
foco
permissões
console
network
```

Nenhuma ação aparente pode ser decorativa.

Nenhum toast pode fingir persistência.

---

# 39. USO DE SUBAGENTES E FERRAMENTAS

Quando disponível, use:

```text
ARCHITECTURE
FRONTEND
BACKEND
DATABASE
SECURITY
DEVOPS
QA
PERFORMANCE
DOCUMENTATION
FINAL AUDITOR
```

O agente principal:

```text
coordena
evita edição concorrente
revisa entregas
resolve conflitos
controla commits
```

Se subagentes não existirem:

```text
execute os papéis sequencialmente
registre cada passe
não use a ausência como blocker
```

---

# 40. GIT E RELEASE

Preferir branch por fase:

```text
feature/phase-012-meetings
feature/phase-013-services
...
```

Commits:

```text
Conventional Commits
pequenos
atômicos
testados
```

Não misturar fases.

Após gate:

```text
push
PR
CI
merge
```

Quando PR não estiver disponível:

```text
registrar limitação
preservar branch e commit
continuar sem falsificar merge
```

---

# 41. SECRETS

Nunca commitar:

```text
.env
senhas
tokens
chaves
cookies
credenciais
private keys
```

Antes de cada commit:

```text
secret scan
git diff --cached --check
verificar .env ignorado
verificar arquivos temporários
```

---

# 42. CREDENCIAIS EXTERNAS

Se uma credencial estiver ausente:

```text
continue todas as etapas locais
implemente contrato
implemente configuração
teste com equivalente controlado
documente o bloqueio externo
pare somente no gate que exige homologação real
```

Não interrompa o projeto meses antes do gate correspondente.

---

# 43. CRITÉRIOS CONTRA IMPLEMENTAÇÃO FALSA

Não considerar concluído quando:

```text
array local substitui banco
botão só exibe toast
endpoint retorna mock permanente
upload não salva
PDF é placeholder
permissão só esconde menu
transação financeira não é atômica
job não é idempotente
e-mail não entra em fila
n8n não tem contrato
IA bloqueia sistema
teste não executa operação real
```

Mocks:

```text
somente testes
somente development
somente fronteira externa
claramente identificados
nunca conclusão de produção
```

---

# 44. PRÉ-COMMIT

Executar:

```powershell
git status --short
git diff --check
git diff --cached --check
git diff --cached --stat
```

Confirmar:

```text
docs/planejamento alterado indevidamente = NO
secrets = 0
.env staged = NO
coverage staged = NO
logs temporários staged = NO
.playwright-mcp staged = NO
screenshots temporários staged = NO
migration histórica sobrescrita = NO
mudanças do usuário apropriadas = NO
```

---

# 45. DEFINITION OF DONE GLOBAL

O projeto só está concluído quando:

```text
GATE-011..GATE-030 aprovados
todos os FRs em escopo implementados ou explicitamente parciais por dependência externa real
FR-062 e FR-073 fora do escopo
frontend funcional
backend funcional
banco funcional
auth funcional
RBAC funcional
CRM funcional
reuniões funcionais
serviços funcionais
propostas funcionais
contratos funcionais
projetos funcionais
tarefas funcionais
financeiro funcional
marketing funcional
notificações funcionais
arquivos funcionais
automações funcionais
n8n validado
Ollama validado
auditoria funcional
observabilidade funcional
CI/CD funcional
backup testado
restore testado
staging aprovado
homologação aprovada
produção implantada
estabilização concluída
rastreabilidade completa
documentação atualizada
zero secret no repositório
zero acesso ao legado
```

---

# 46. RELATÓRIO FINAL

Atualizar:

```text
docs/implementacao/08-RELATORIO-FINAL-DE-IMPLEMENTACAO.md
```

Incluir:

```text
versão
commit
branch
release
ambientes
fases
gates
FRs
APIs
tabelas
permissões
testes
cobertura
E2E
acessibilidade
performance
segurança
backup
restore
staging
produção
riscos residuais
bloqueios externos
```

Não omitir falhas.

---

# 47. RESPOSTA INICIAL

Responda inicialmente somente:

```text
ROLE = AGENTE_EXECUTOR
EXECUTION_ENVIRONMENT =
PROJECT_ROOT =
REPOSITORY =
LOCAL_BRANCH =
LOCAL_HEAD =
REMOTE_MAIN_HEAD =
WORKTREE_STATE =
LAST_APPROVED_PHASE =
CURRENT_PHASE =
CURRENT_GATE =
PHASE_011_CODE_PRESENT =
PHASE_011_DOCS_RECONCILED =
NEXT_ACTION = AUDIT_AND_CERTIFY_PHASE_011
```

Depois comece imediatamente.

Não aguarde confirmação.

---

# 48. RESPOSTA DE CADA FASE

Após cada fase:

```text
PHASE =
GATE =
STATUS =
COMMITS =
PR =
FILES_CREATED =
FILES_CHANGED =
MIGRATIONS =
FRS_IMPLEMENTED =
FRS_PARTIAL =
TESTS_EXECUTED =
TESTS_PASSED =
TESTS_FAILED =
COVERAGE =
SECURITY_REVIEW =
SPEC_REVIEW =
QA_REVIEW =
TRACEABILITY_UPDATED =
BLOCKERS =
NEXT_PHASE =
AUTO_CONTINUE = YES
```

Não pare após responder.

Continue automaticamente.

---

# 49. RESPOSTA FINAL

Somente ao concluir:

```text
PROJECT = LYVOX_GERENCIAMENTO
PROJECT_MODE = CLEAN_GREENFIELD
REPOSITORY =
RELEASE_VERSION =
FINAL_COMMIT =

PHASES_APPROVED =
GATES_APPROVED =
FRS_TOTAL =
FRS_IMPLEMENTED =
FRS_PARTIAL =
FRS_OUT_OF_SCOPE = FR-062, FR-073

FRONTEND_STATUS =
BACKEND_STATUS =
DATABASE_STATUS =
AUTH_STATUS =
RBAC_STATUS =
CRM_STATUS =
MEETINGS_STATUS =
SERVICES_STATUS =
PROPOSALS_STATUS =
CONTRACTS_STATUS =
PROJECTS_STATUS =
TASKS_STATUS =
FINANCE_STATUS =
MARKETING_STATUS =
NOTIFICATIONS_STATUS =
FILES_STATUS =
AUTOMATIONS_STATUS =
N8N_STATUS =
OLLAMA_STATUS =
AUDIT_STATUS =
OBSERVABILITY_STATUS =
CI_CD_STATUS =

UNIT_TESTS =
COMPONENT_TESTS =
INTEGRATION_TESTS =
DATABASE_TESTS =
API_TESTS =
RBAC_TESTS =
SECURITY_TESTS =
E2E_TESTS =
ACCESSIBILITY_TESTS =
LOAD_TESTS =
SMOKE_TESTS =

STAGING_STATUS =
PRODUCTION_STATUS =
BACKUP_STATUS =
RESTORE_STATUS =
ROLLBACK_STATUS =
HYPERCARE_STATUS =

OPEN_CRITICAL_BUGS =
OPEN_HIGH_BUGS =
OPEN_MEDIUM_BUGS =
OPEN_LOW_BUGS =
RESIDUAL_RISKS =
EXTERNAL_BLOCKERS =

TRACEABILITY_COMPLETE =
DOCUMENTATION_UPDATED =
SECRETS_FOUND_IN_REPO =
LEGACY_PROJECT_ACCESSED = NO

ALL_REQUIRED_PHASES_COMPLETE =
ALL_REQUIRED_GATES_APPROVED =
SYSTEM_READY_FOR_OPERATION =
```

Não declarar:

```text
SYSTEM_READY_FOR_OPERATION = YES
```

sem evidências.

---

# 50. INÍCIO IMEDIATO

Execute agora:

```text
1. inspeção local e remota
2. leitura canônica
3. reconciliação da PHASE-011
4. validação do GATE-011
5. certificação documental
6. início automático da PHASE-012
7. continuação até PHASE-030
```

Não reinicie.

Não replaneje.

Não acesse legado.

Não faça perguntas de rotina.

Não falsifique gates.

Não entregue resultado parcial como conclusão.
