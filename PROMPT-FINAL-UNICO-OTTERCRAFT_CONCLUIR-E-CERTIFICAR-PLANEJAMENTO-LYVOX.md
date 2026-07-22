# PROMPT FINAL ÚNICO — CONCLUIR, CORRIGIR E CERTIFICAR O PLANEJAMENTO GREENFIELD DO LYVOX GERENCIAMENTO

## 0. NATUREZA DESTA INSTRUÇÃO

Esta é a instrução única, integral e prioritária desta atuação.

Ela substitui:

- interpretações anteriores;
- conclusões anteriores;
- declarações anteriores de readiness;
- decisões ambíguas;
- relatórios de consistência anteriores;
- qualquer pedido anterior para perguntar ao usuário;
- qualquer proposta de implementação.

Você deve executar o trabalho do início ao fim em uma única atuação.

Não pergunte se deve continuar.

Não solicite aprovação intermediária.

Não interrompa para pedir esclarecimentos.

Não devolva relatório parcial.

Não declare conclusão antes de todos os critérios objetivos deste prompt passarem.

---

# 1. PAPEL

Atue como um comitê técnico independente formado por:

```text
PRODUCT_ARCHITECT
SOFTWARE_ARCHITECT
FRONTEND_ARCHITECT
BACKEND_ARCHITECT
DATA_ARCHITECT
SECURITY_ARCHITECT
DEVOPS_ARCHITECT
SRE_ARCHITECT
QA_ARCHITECT
TECHNICAL_WRITER
TRACEABILITY_AUDITOR
CONSISTENCY_REVIEWER
```

A implementação futura será feita pelo Codex.

Nesta atuação:

```text
IMPLEMENTATION_EXECUTOR = CODEX
OTTERCRAFT_ROLE = PLANNING_AND_DOCUMENTATION_ONLY
IMPLEMENTATION_ALLOWED = NO
CODE_CREATION_ALLOWED = NO
DEPENDENCY_INSTALLATION_ALLOWED = NO
DATABASE_CREATION_ALLOWED = NO
DEPLOY_ALLOWED = NO
VPS_MUTATION_ALLOWED = NO
```

---

# 2. DIRETÓRIO E ARQUIVOS

Considere a pasta atualmente aberta como:

```text
PROJECT_ROOT
```

O pacote existente está em:

```text
<PROJECT_ROOT>/docs/planejamento/
```

Existem exatamente 29 documentos planejados, numerados de `00` a `28`.

Você deve revisar, corrigir, ampliar e consolidar diretamente esses 29 documentos.

Não crie documentos adicionais.

Não crie `PART1`, `PART2`, rascunhos, cópias, backups ou arquivos auxiliares no projeto.

Não remova nenhum dos 29 documentos.

Não altere arquivos fora de:

```text
docs/planejamento/
```

Você pode executar comandos de leitura e validação.

Caso precise de script temporário, utilize exclusivamente o diretório temporário do sistema operacional e remova-o antes de concluir.

---

# 3. RESULTADO OBRIGATÓRIO

Ao final, o pacote deve ser suficiente para o Codex construir o sistema integralmente do zero sem:

- acessar projeto legado;
- inventar requisitos;
- escolher stack;
- escolher arquitetura;
- criar regras de negócio não documentadas;
- improvisar banco;
- improvisar permissões;
- improvisar endpoints;
- ignorar testes;
- ignorar backup;
- ignorar observabilidade;
- perguntar o que deve fazer em cada fase;
- alterar decisões silenciosamente.

O Codex deve encontrar nos documentos:

```text
produto definido
escopo definido
fora de escopo definido
atores definidos
telas definidas
fluxos definidos
requisitos definidos
regras definidas
arquitetura definida
stack definida
frontend definido
backend definido
banco definido
API definida
auth definida
RBAC definido
segurança definida
storage definido
filas definidas
jobs definidos
n8n definido
IA definida
infraestrutura definida
observabilidade definida
performance definida
testes definidos
backups definidos
CI/CD definido
roadmap definido
gates definidos
riscos definidos
runbooks definidos
handoff definido
rastreabilidade completa
consistência comprovada
```

---

# 4. MODO DO PROJETO

```text
PROJECT_MODE = CLEAN_GREENFIELD
LEGACY_PROJECT_ACCESS = PROHIBITED
LEGACY_CODE_REUSE = NO
LEGACY_DATABASE_REUSE = NO
LEGACY_SCHEMA_REUSE = NO
LEGACY_AUTH_REUSE = NO
LEGACY_DATA_MIGRATION = NO
SUPABASE_DEPENDENCY = NO
FIREBASE_DEPENDENCY = NO
VERCEL_RUNTIME_DEPENDENCY = NO
MANAGED_BACKEND_DEPENDENCY = NO
```

O sistema deve ser criado como novo projeto separado.

Não audite, abra, copie, consulte ou use projeto legado.

---

# 5. DECISÕES DE PRODUTO CONGELADAS

As decisões desta seção são obrigatórias e devem ser tratadas como:

```text
USER_APPROVED_FOR_PLANNING
```

Não transforme esses itens em `DECISION_BLOCKED`.

Não proponha alternativa concorrente na versão inicial.

## 5.1 Uso organizacional

```text
INITIAL_DEPLOYMENT_MODEL = SINGLE_ORGANIZATION
ORGANIZATION = LYVOX
SAAS_MULTI_TENANCY = OUT_OF_SCOPE_INITIAL
GLOBAL_SUPER_ADMIN = OUT_OF_SCOPE_INITIAL
EXTERNAL_CLIENT_PORTAL = OUT_OF_SCOPE_INITIAL
PUBLIC_SELF_REGISTRATION = NO
```

O sistema inicial será interno da Lyvox.

Não adicionar `organization_id` em todas as tabelas apenas para preparar SaaS.

A evolução futura para multi-organização pode ser registrada como possibilidade arquitetural, mas não deve aumentar a complexidade do MVP.

## 5.2 Usuários e cargos iniciais

Criar seeds para cinco cargos:

```text
Administrador
Gestão
Financeiro
Comercial
Operacional
```

Permitir cargos customizados posteriormente pelo módulo de RBAC.

O primeiro usuário será criado por bootstrap administrativo seguro.

Não gerar senha em log de produção.

O bootstrap deverá exigir senha fornecida por secret e troca obrigatória no primeiro login.

## 5.3 Cadastro e acesso

```text
PUBLIC_REGISTRATION = NO
USER_CREATION = ADMIN_ONLY
INVITATION_FLOW = YES
PASSWORD_RESET = YES
MFA_ADMIN = REQUIRED
MFA_OTHER_ROLES = OPTIONAL
ACTIVE_SESSION_MANAGEMENT = YES
```

## 5.4 Clientes

Incluir:

- pessoa física;
- pessoa jurídica;
- contatos;
- endereços;
- documentos;
- tags;
- responsáveis;
- status;
- histórico;
- vínculos com leads, reuniões, propostas, contratos, projetos e financeiro.

CPF e CNPJ:

- armazenados somente quando necessários;
- validação de formato e dígitos verificadores;
- criptografia de coluna quando classificado como dado sensível;
- sem consulta automática a órgãos externos;
- sem afirmar conformidade jurídica absoluta.

## 5.5 Leads e CRM

Incluir:

- pipeline personalizável;
- etapas;
- origem;
- responsável;
- notas;
- histórico;
- follow-ups;
- templates;
- cadências;
- importação CSV;
- captura via webhook autenticado;
- conversão em cliente;
- métricas.

Não incluir discador, enriquecimento pago ou scraping de redes sociais no escopo inicial.

## 5.6 Reuniões

Incluir:

- agenda interna;
- participantes;
- pauta;
- notas;
- anexos;
- vínculos;
- transcrição enviada pelo usuário;
- análise por IA;
- geração opcional de tarefas.

Integração bidirecional com Google Calendar:

```text
OUT_OF_SCOPE_INITIAL
```

Pode ser registrada como evolução futura.

## 5.7 Serviços e valores

Incluir:

- categorias;
- serviços;
- unidade de cobrança;
- cobrança pontual ou recorrente;
- valores;
- versionamento de preço;
- status;
- configurações.

## 5.8 Propostas e contratos

Incluir:

- propostas;
- itens;
- descontos;
- validade;
- condições;
- versões;
- status;
- geração de PDF;
- aprovação interna;
- conversão em contrato;
- vínculo financeiro;
- histórico;
- cancelamento;
- auditoria.

Não incluir no escopo inicial:

```text
portal externo
assinatura digital qualificada
certificado ICP-Brasil
aceite eletrônico com valor jurídico garantido
```

O envio externo inicial será por PDF exportado.

## 5.9 Projetos e tarefas

Incluir:

- projetos;
- membros;
- responsáveis;
- status;
- prioridade;
- datas;
- orçamento de referência;
- tarefas;
- subtarefas;
- comentários;
- anexos;
- atividade;
- lista;
- Kanban;
- calendário;
- Gantt;
- filtros;
- indicadores.

Timesheet:

```text
OUT_OF_SCOPE_INITIAL
```

Pode ser documentado como evolução.

## 5.10 Financeiro

Incluir:

- receitas;
- despesas;
- contas a receber;
- contas a pagar;
- categorias;
- centros de custo;
- contas/caixas internos;
- competência;
- vencimento;
- pagamento;
- recorrência;
- parcelamento;
- vínculo com cliente, proposta, contrato ou projeto;
- fluxo de caixa;
- relatórios gerenciais;
- auditoria.

Não incluir:

```text
integração bancária
Open Finance
conciliação automática
PIX automático
boletos
gateway de pagamento
emissão fiscal
contabilidade completa
folha de pagamento
DRE contábil oficial
```

Pode existir relatório gerencial simplificado, claramente identificado como não contábil.

## 5.11 Marketing

Incluir:

- ideias;
- calendário editorial;
- posts;
- campanhas;
- kit de marca;
- geração assistida por IA;
- revisão;
- exportação.

Não publicar diretamente em redes sociais na versão inicial.

Publicação externa:

```text
OUT_OF_SCOPE_INITIAL
```

## 5.12 Automações

Incluir:

- automações;
- versão;
- trigger;
- condições;
- ações;
- ativação;
- desativação;
- execução manual;
- agendamento;
- histórico;
- retries;
- falhas;
- integração n8n;
- auditoria.

Regra empresarial crítica deve existir no backend, não somente no n8n.

## 5.13 Notificações e e-mail

Incluir:

- notificações internas;
- lidas e não lidas;
- prioridade;
- link contextual;
- preferências;
- e-mails transacionais.

Produção usará abstração SMTP configurada por variáveis de ambiente.

Desenvolvimento usará Mailpit local.

Não escolher provedor comercial obrigatório.

## 5.14 Arquivos

Incluir:

- upload;
- download;
- metadados;
- checksum;
- autorização;
- versionamento;
- vínculo contextual;
- PDFs;
- imagens;
- documentos;
- anexos;
- retenção;
- backup.

## 5.15 IA

Incluir:

- abstração de provider;
- Ollama local como provider inicial;
- fila;
- worker;
- status;
- timeout;
- cancelamento;
- histórico;
- auditoria;
- limites;
- proteção de dados;
- modo degradado.

Não incluir fallback pago automático para API externa.

Providers externos podem ser extensão futura, desativada por padrão.

O sistema deve operar sem IA.

## 5.16 Auditoria

Incluir:

- login;
- logout;
- falhas de login;
- alterações de usuários;
- cargos;
- permissões;
- operações financeiras;
- propostas;
- contratos;
- automações;
- documentos;
- exportações;
- exclusões;
- ações administrativas.

## 5.17 Exclusão e retenção

Adotar:

```text
SOFT_DELETE_FOR_BUSINESS_RECORDS = YES
HARD_DELETE_FOR_TEMPORARY_DATA = CONTROLLED
AUDIT_LOG_IMMUTABLE = YES
```

Defaults operacionais, não afirmações legais:

```text
SECURITY_LOG_RETENTION = 180 dias
AUDIT_LOG_RETENTION = 730 dias
BACKUP_RETENTION = 30 dias
TRASH_RETENTION = 30 dias
```

Os prazos devem ser configuráveis.

Não afirmar que esses prazos satisfazem toda obrigação legal ou fiscal.

---

# 6. DECISÕES TÉCNICAS CONGELADAS

Estas decisões devem ser usadas em todos os documentos.

Não apresentar alternativa concorrente para a versão inicial.

## 6.1 Arquitetura

```text
ARCHITECTURE = MODULAR_MONOLITH
INITIAL_MICROSERVICES = NO
DOMAIN_BOUNDARIES = YES
STATELESS_API = YES
ASYNC_WORKER = SEPARATE_PROCESS
```

## 6.2 Monorepo

```text
MONOREPO = PNPM_WORKSPACES_WITH_TURBOREPO
PACKAGE_MANAGER = PNPM
```

Estrutura:

```text
apps/web
apps/api
apps/worker
packages/contracts
packages/database
packages/auth
packages/permissions
packages/validation
packages/observability
packages/config
packages/shared
infrastructure
docs
tests
```

## 6.3 Frontend

```text
FRONTEND = REACT_WITH_VITE_AND_TYPESCRIPT
ROUTER = REACT_ROUTER
SERVER_STATE = TANSTACK_QUERY
CLIENT_STATE = ZUSTAND_ONLY_FOR_UI_PREFERENCES
FORMS = REACT_HOOK_FORM
VALIDATION = ZOD
STYLING = CSS_TOKENS_PLUS_COMPONENT_SYSTEM
```

Ottercraft deve pesquisar documentação oficial atual e registrar versões estáveis compatíveis.

Não usar a expressão `React 18/19`.

Escolher e registrar uma versão estável exata, validada no momento da documentação.

Zustand não armazenará token, senha, permissão definitiva ou dado sensível.

## 6.4 Backend

```text
BACKEND = NESTJS_WITH_FASTIFY_ADAPTER
LANGUAGE = TYPESCRIPT
API_STYLE = REST
API_PREFIX = /api/v1
API_SPECIFICATION = OPENAPI
```

Camadas obrigatórias:

```text
domain
application
infrastructure
interfaces/http
tests
```

## 6.5 Banco e data access

```text
DATABASE = POSTGRESQL
DATA_ACCESS = DRIZZLE_ORM_WITH_EXPLICIT_SQL_WHEN_REQUIRED
MIGRATIONS = VERSIONED_SQL_MIGRATIONS
```

Ottercraft deve pesquisar e fixar uma versão estável do PostgreSQL suportada no momento.

PostgreSQL será a fonte de verdade.

## 6.6 Autenticação

Usar sessão opaca server-side.

```text
AUTH_MODEL = OPAQUE_SERVER_SIDE_SESSION
JWT_IN_BROWSER = NO
ACCESS_TOKEN_IN_LOCAL_STORAGE = NO
REFRESH_TOKEN_IN_BROWSER = NO
SESSION_COOKIE = HTTPONLY_SECURE_SAMESITE_LAX
SESSION_SOURCE_OF_TRUTH = POSTGRESQL
SESSION_CACHE = REDIS
PASSWORD_HASH = ARGON2ID
MFA = TOTP
```

Fluxo obrigatório:

1. login valida credenciais;
2. backend gera token aleatório criptograficamente seguro;
3. somente o hash do token é salvo;
4. registro de sessão persistente fica no PostgreSQL;
5. Redis mantém cache de sessão;
6. cookie contém apenas o token opaco;
7. logout revoga PostgreSQL e Redis;
8. logout global revoga todas as sessões;
9. sessão pode funcionar por fallback no PostgreSQL se Redis estiver indisponível;
10. criação de sessão nova deve ser limitada por rate limit;
11. CSRF será protegido por SameSite=Lax, verificação de Origin e token CSRF para operações de mutação;
12. nenhuma autorização depende apenas do frontend.

## 6.7 RBAC

```text
AUTHORIZATION = RBAC_PLUS_RESOURCE_OWNERSHIP
DEFAULT_POLICY = DENY
CUSTOM_ROLES = YES
SEEDED_ROLES = 5
```

Permissões no formato:

```text
resource.action
```

Exemplos:

```text
clients.read
clients.create
clients.update
clients.archive
clients.delete
clients.export
proposals.approve
financial.pay
users.manage
roles.manage
audit.read
```

## 6.8 Redis

Redis será usado para:

- cache de sessão;
- cache de leitura;
- rate limiting;
- locks curtos;
- BullMQ;
- deduplicação temporária.

Redis não será fonte de verdade.

Se Redis cair:

- consultas principais continuam;
- sessões existentes podem ser validadas no PostgreSQL;
- login continua com capacidade reduzida;
- cache fica desativado;
- rate limiting usa fallback local conservador;
- jobs assíncronos ficam pausados;
- automações, IA, e-mails e geração assíncrona ficam indisponíveis até recuperação;
- operações síncronas de negócio continuam quando não dependem de job.

Não declarar operação integral de 100%.

## 6.9 Filas

```text
QUEUE = BULLMQ
QUEUE_BACKEND = REDIS
```

Filas iniciais:

```text
emails
notifications
documents
reports
n8n
ai
automation
maintenance
```

Cada fila deve possuir:

- payload;
- schema;
- producer;
- consumer;
- timeout;
- retry;
- backoff;
- idempotência;
- DLQ;
- retenção;
- replay;
- métricas.

## 6.10 Storage

```text
INITIAL_STORAGE = PRIVATE_FILESYSTEM_WITH_STORAGE_ABSTRACTION
MINIO_INITIAL = NO
PUBLIC_PRIVATE_FILE_URL = NO
```

MinIO será apenas gatilho futuro quando houver:

- múltiplas instâncias;
- necessidade de API S3;
- volume incompatível com um único host;
- segundo nó.

## 6.11 Reverse proxy

```text
REVERSE_PROXY = CADDY
TLS = AUTOMATIC_ACME
```

## 6.12 Deploy

```text
DEPLOYMENT = DOCKER_COMPOSE
KUBERNETES = OUT_OF_SCOPE
NOMAD = OUT_OF_SCOPE
K3S = OUT_OF_SCOPE
```

Não prometer zero downtime na primeira versão.

Modelo inicial:

```text
CONTROLLED_DEPLOYMENT_WINDOW
HEALTH_CHECK
DATABASE_BACKUP_BEFORE_MIGRATION
EXPAND_CONTRACT_MIGRATIONS
GRACEFUL_SHUTDOWN
VERSIONED_RELEASE
ROLLBACK_TO_PREVIOUS_IMAGE
```

Blue-green pode ser evolução futura após benchmark de capacidade.

## 6.13 Observabilidade

Inicial:

```text
STRUCTURED_LOGS = PINO_JSON
METRICS = PROMETHEUS
DASHBOARDS = GRAFANA
LOG_STORAGE = LOKI
TRACING_BACKEND_INITIAL = NO
OPENTELEMETRY_INSTRUMENTATION = YES
```

OpenTelemetry deve preparar instrumentação e correlação.

Tempo não será instalado inicialmente.

Traces persistentes serão fase futura.

Não afirmar rastreamento distribuído consultável sem backend.

## 6.14 Backups

```text
POSTGRES_BACKUP = PGBACKREST
FILE_BACKUP = RESTIC
OFFSITE_PROTOCOL = S3_COMPATIBLE_ENCRYPTED_TARGET
```

O endpoint S3 será configurável.

O provedor não será fixado no produto.

Backup no mesmo host não é disaster recovery.

## 6.15 CI/CD

```text
CI_CD = GITHUB_ACTIONS
CONTAINER_REGISTRY = GHCR
```

Pipeline:

```text
lint
typecheck
unit
integration
build
security scan
container build
push immutable image
staging
migration check
smoke
manual production approval
production deploy
post-deploy smoke
rollback
```

## 6.16 Testes

```text
UNIT = VITEST
FRONTEND_COMPONENT = TESTING_LIBRARY
E2E = PLAYWRIGHT
LOAD = K6
API_INTEGRATION = TESTCONTAINERS_OR_ISOLATED_COMPOSE_TEST_ENVIRONMENT
```

---

# 7. CAPACIDADE DA VPS CONGELADA PARA PLANEJAMENTO

Referência:

```text
CPU = 16 vCPU
RAM = aproximadamente 62 GiB
GPU = nenhuma GPU dedicada
EXISTING_SERVICES = n8n, Qdrant, Ollama
```

Se a VPS não puder ser auditada em read-only:

```text
VPS_LIVE_AUDIT = NOT_AVAILABLE
```

Usar orçamento conservador.

## 7.1 Orçamento máximo de RAM

Reservar:

```text
OS_KERNEL_PAGE_CACHE_MARGIN = 12 GiB
```

Limites planejados máximos:

```text
Ollama = 20 GiB
Qdrant = 3 GiB
n8n = 3 GiB
PostgreSQL + PgBouncer = 6 GiB
Redis = 1.5 GiB
API = 2 GiB
Worker = 2 GiB
Web + Caddy = 0.5 GiB
Prometheus + Grafana + Loki = 2 GiB
Backup transient = 1 GiB
```

Total de serviços planejados:

```text
41 GiB
```

Total com reserva:

```text
53 GiB
```

Margem aproximada:

```text
9 GiB
```

O documento deve diferenciar:

- consumo esperado;
- reserva;
- limite;
- pico;
- prioridade;
- comportamento em pressão de memória.

Não prometer concorrência entre Ollama e testes de carga sem benchmark.

IA deve ser limitada e enfileirada.

## 7.2 CPU

Não somar limites de CPU como capacidade garantida.

Definir prioridades:

1. PostgreSQL;
2. API;
3. Redis;
4. worker transacional;
5. n8n;
6. Qdrant;
7. observabilidade;
8. Ollama.

Ollama deve usar concorrência baixa e ceder recursos ao sistema principal.

---

# 8. METAS NÃO FUNCIONAIS

Metas de teste, não garantias:

```text
REGISTERED_USERS_REFERENCE = 10.000
CONCURRENT_SESSIONS_REFERENCE = 500
SUSTAINED_RPS_REFERENCE = 100
COMMON_READ_P95_TARGET = 250 ms
COMMON_WRITE_P95_TARGET = 500 ms
DATABASE_QUERY_P95_TARGET = 100 ms
HTTP_INFRA_ERROR_RATE_TARGET = menor que 0,5%
AVAILABILITY_TARGET_INITIAL = 99,5% mensal, excluindo manutenção anunciada
```

Definir:

- dataset;
- payload;
- warm-up;
- duração;
- concorrência;
- ambiente;
- P50;
- P95;
- P99;
- throughput;
- erros;
- saturação;
- critérios de parada.

Não exigir 0% absoluto de erro.

Não usar benchmark sintético de framework como capacidade do produto.

---

# 9. ESCOPO FUNCIONAL OBRIGATÓRIO

Os documentos devem cobrir integralmente:

```text
Identidade e Acesso
Dashboard
Clientes
Leads e CRM
Reuniões
Serviços e Valores
Propostas e Contratos
Projetos e Tarefas
Financeiro
Marketing
Automações
Notificações
Arquivos e Documentos
Configurações
Assistente e IA
Auditoria
```

Não adicionar outro módulo de negócio na versão inicial.

Capacidades técnicas não são módulos de negócio.

---

# 10. DOCUMENTOS OBRIGATÓRIOS

Manter exatamente:

```text
00-INDICE-MESTRE-E-STATUS.md
01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md
02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md
03-ARQUITETURA-DE-INFORMACAO-TELAS-E-NAVEGACAO.md
04-UX-DESIGN-SYSTEM-E-ACESSIBILIDADE.md
05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md
06-ARQUITETURA-FRONTEND.md
07-ARQUITETURA-BACKEND.md
08-MODELAGEM-POSTGRESQL-E-DICIONARIO-DE-DADOS.md
09-CONTRATOS-API-REST-E-OPENAPI.md
10-AUTENTICACAO-RBAC-E-SEGURANCA.md
11-CACHE-FILAS-WORKERS-E-JOBS.md
12-ARQUIVOS-DOCUMENTOS-E-STORAGE.md
13-INTEGRACOES-N8N-IA-E-SERVICOS-EXTERNOS.md
14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md
15-OBSERVABILIDADE-SRE-SLI-SLO-E-ALERTAS.md
16-PERFORMANCE-CAPACIDADE-E-ESCALABILIDADE.md
17-ESTRATEGIA-DE-TESTES-QA-E-HOMOLOGACAO.md
18-AMBIENTES-CONFIGURACOES-SEEDS-E-BOOTSTRAP.md
19-BACKUP-RESTORE-DR-E-CONTINUIDADE.md
20-CI-CD-VERSIONAMENTO-RELEASE-E-ROLLBACK.md
21-ROADMAP-DE-IMPLEMENTACAO-PARA-CODEX.md
22-MATRIZ-DE-RASTREABILIDADE.md
23-ADRS-DECISOES-ARQUITETURAIS.md
24-RISCOS-PREMISSAS-LACUNAS-E-DECISOES-BLOQUEADAS.md
25-RUNBOOKS-OPERACIONAIS.md
26-HANDOFF-EXECUTIVO-PARA-CODEX.md
27-CHECKLIST-MESTRE-DE-ACEITE.md
28-RELATORIO-FINAL-DE-CONSISTENCIA.md
```

---

# 11. AUDITORIA INICIAL OBRIGATÓRIA

Antes de editar:

1. listar os 29 documentos;
2. calcular linhas, bytes e SHA-256;
3. extrair todos os IDs;
4. extrair todos os links;
5. extrair status;
6. extrair decisões;
7. extrair requisitos;
8. extrair regras;
9. extrair telas;
10. extrair APIs;
11. extrair entidades;
12. extrair permissões;
13. extrair testes;
14. extrair fases;
15. extrair gates;
16. registrar inconsistências.

O conteúdo atual é rascunho.

Não trate o relatório atual como prova de consistência.

---

# 12. REQUISITOS FUNCIONAIS

O DOC-02 atual possui 56 FRs conhecidos:

```text
FR-001
FR-002
FR-003
FR-004
FR-005
FR-006
FR-007
FR-010
FR-011
FR-012
FR-020
FR-021
FR-022
FR-023
FR-030
FR-031
FR-032
FR-033
FR-040
FR-041
FR-042
FR-043
FR-050
FR-051
FR-052
FR-060
FR-061
FR-062
FR-063
FR-070
FR-071
FR-072
FR-073
FR-080
FR-081
FR-082
FR-083
FR-090
FR-091
FR-092
FR-100
FR-101
FR-102
FR-110
FR-111
FR-112
FR-120
FR-121
FR-122
FR-130
FR-131
FR-140
FR-141
FR-142
FR-150
FR-151
```

Aplicar as decisões congeladas:

```text
FR-062 = OUT_OF_SCOPE_INITIAL
FR-073 = OUT_OF_SCOPE_INITIAL
```

FR-083 deve ser descrito como relatório gerencial simplificado, não DRE contábil oficial.

FR-141 não deve conter fallback automático pago.

Todos os demais FRs permanecem no escopo inicial, com ajustes de clareza.

Cada FR deve conter:

```text
ID
módulo
nome
classificação
ator
pré-condições
ação
entrada
saída
estados
validações
permissão
dados
API
eventos/jobs
erros
auditoria
critérios de aceite
fora de escopo
```

Não usar somente a palavra CRUD.

Detalhar todas as operações.

---

# 13. REGRAS DE NEGÓCIO

O DOC-02 possui 20 BRs conhecidos.

Revisar e manter IDs únicos.

Cada regra deve conter:

```text
ID
módulo
descrição
gatilho
pré-condição
invariantes
transação
concorrência
erros
auditoria
FRs relacionados
testes
```

Regras críticas devem ser aplicadas no backend ou banco.

Não deixar regra crítica somente na UI ou n8n.

---

# 14. TELAS E NAVEGAÇÃO

O DOC-03 deve definir todas as telas necessárias.

Para cada tela:

```text
SCR-ID
rota
módulo
objetivo
atores
permissões
dados
ações
componentes
modais
estados
loading
empty
error
403
responsividade
atalhos
links
FRs
```

Cobrir:

```text
login
recuperação
troca de senha
MFA
sessões
dashboard
clientes
lead pipeline
lead lista
lead detalhe
cadências
follow-ups
reuniões
serviços
propostas
contratos
projetos
tarefas
financeiro
marketing
automações
execuções
notificações
arquivos
usuários
cargos
permissões
configurações
IA
auditoria
403
404
500
manutenção
```

Incluir:

- sitemap;
- desktop navigation;
- mobile navigation;
- breadcrumbs;
- busca global;
- deep links;
- redirects;
- matriz rota-permissão;
- Mermaid válido.

---

# 15. UX E DESIGN SYSTEM

O DOC-04 deve fechar:

- estética escura premium;
- destaque âmbar/dourado;
- light mode opcional futuro;
- grid;
- breakpoints;
- tipografia;
- tokens;
- espaçamento;
- densidade;
- componentes;
- estados;
- feedback;
- animações discretas;
- redução de movimento;
- teclado;
- foco;
- contraste;
- WCAG 2.2 AA;
- tabelas responsivas;
- mobile-first;
- acessibilidade de gráficos;
- acessibilidade de Kanban e Gantt;
- formulários;
- máscaras;
- datas;
- moeda;
- arquivos;
- confirmação de ações destrutivas.

Não gerar código.

---

# 16. ARQUITETURA GERAL

O DOC-05 deve refletir exatamente as decisões congeladas.

Incluir Mermaid para:

```text
system context
containers
components
deployment
synchronous request
asynchronous job
auth session
file flow
n8n flow
AI flow
backup flow
failure degradation
```

Declarar:

```text
ONE_VPS_IS_A_SINGLE_POINT_OF_FAILURE
```

Não declarar alta disponibilidade real.

---

# 17. FRONTEND

O DOC-06 deve definir:

- estrutura completa;
- módulos;
- router;
- layouts;
- TanStack Query;
- Zustand apenas para UI;
- React Hook Form;
- Zod;
- API client;
- cookies;
- CSRF;
- error boundaries;
- lazy loading;
- code splitting;
- accessibility;
- tests;
- conventions;
- imports;
- date/time;
- currency;
- files;
- secure browser behavior.

Remover:

```text
Authorization Bearer
token em Zustand
token em localStorage
React 18/19
```

Toda autorização final é do backend.

---

# 18. BACKEND

O DOC-07 deve especificar:

- NestJS;
- Fastify adapter;
- módulos;
- domain;
- application;
- infrastructure;
- interfaces;
- use cases;
- repositories;
- transactions;
- validation;
- error envelope;
- correlation ID;
- audit;
- sessions;
- RBAC;
- rate limit;
- queues;
- files;
- integrations;
- graceful shutdown;
- health;
- readiness;
- tests;
- dependency rules.

Nenhum módulo acessa tabela privada de outro módulo sem contrato.

---

# 19. MODELAGEM POSTGRESQL

O DOC-08 deve definir todas as entidades necessárias.

Catálogo inicial esperado:

## Identidade

```text
users
password_credentials
password_history
sessions
mfa_factors
mfa_backup_codes
password_reset_tokens
login_attempts
roles
permissions
role_permissions
user_roles
security_events
```

## Clientes

```text
clients
client_contacts
client_addresses
client_documents
client_tags
client_tag_links
client_responsibles
client_status_history
```

## Leads

```text
leads
lead_stages
lead_stage_history
lead_notes
lead_followups
lead_sources
cadences
cadence_steps
lead_cadence_enrollments
lead_import_jobs
```

## Reuniões

```text
meetings
meeting_participants
meeting_notes
meeting_attachments
meeting_transcripts
meeting_ai_analyses
meeting_action_items
```

## Serviços

```text
service_categories
services
service_price_versions
```

## Propostas e contratos

```text
proposals
proposal_versions
proposal_items
proposal_status_history
contracts
contract_status_history
```

## Projetos e tarefas

```text
projects
project_members
project_status_history
tasks
task_assignees
task_comments
task_attachments
task_status_history
```

Usar `parent_task_id` para subtarefas.

Não criar timesheet inicial.

## Financeiro

```text
financial_accounts
financial_categories
cost_centers
financial_transactions
financial_installments
financial_recurrences
financial_payment_events
```

## Marketing

```text
marketing_ideas
marketing_posts
marketing_campaigns
brand_kits
brand_assets
```

## Automações

```text
automations
automation_versions
automation_triggers
automation_conditions
automation_actions
automation_executions
automation_execution_steps
```

## Notificações

```text
notifications
notification_preferences
email_deliveries
```

## Arquivos

```text
files
file_versions
file_links
```

## Integrações e assíncrono

```text
integration_configs
webhook_deliveries
outbox_events
inbox_events
idempotency_keys
ai_jobs
job_failures
```

## Configurações e auditoria

```text
company_settings
system_settings
feature_flags
audit_logs
```

A lista deve ser racionalizada conforme os FRs.

Não criar tabela sem finalidade.

Para cada tabela:

```text
DB-ID
nome
módulo
objetivo
colunas
tipos
PK
FK
UNIQUE
CHECK
NOT NULL
índices
índices parciais
soft delete
version
created_at
updated_at
deleted_at
retenção
transações
FRs consumidores
```

Definir:

- UUID strategy;
- timestamps UTC;
- monetary numeric precision;
- timezone;
- optimistic locking;
- isolation levels;
- retry de serialização;
- idempotency;
- outbox;
- inbox;
- constraints;
- ERD Mermaid completo;
- migration conventions;
- seed conventions;
- expand/contract.

Todos os DB-IDs utilizados em qualquer documento devem estar definidos aqui.

---

# 20. API REST

O DOC-09 deve definir endpoint para todo FR que exige backend.

Recursos:

```text
auth
sessions
mfa
users
roles
permissions
dashboard
clients
leads
stages
followups
cadences
meetings
services
proposals
contracts
projects
tasks
financial
marketing
automations
automation-executions
notifications
files
settings
ai
audit
integrations
health
readiness
```

Para cada endpoint:

```text
API-ID
método
rota
FR
módulo
auth
permissão
request
response
status codes
validation
error codes
transaction
idempotency
cache
audit
rate limit
timeout
```

Regras:

- API-ID único;
- rota única por operação;
- `/api/v1`;
- cursor pagination;
- filters;
- sorting;
- search;
- error envelope;
- request ID;
- correlation ID;
- idempotency key;
- ETag quando aplicável;
- upload limits;
- OpenAPI.

Todos os API-IDs utilizados em qualquer documento devem estar definidos aqui.

---

# 21. AUTH E RBAC

O DOC-10 deve seguir o modelo de sessão opaca definido.

Não misturar JWT, Bearer e refresh token.

Definir:

- login;
- logout;
- logout global;
- cookie;
- token hash;
- PostgreSQL;
- Redis cache;
- expiration;
- idle timeout;
- rotation;
- password reset;
- MFA;
- backup codes;
- lockout;
- devices;
- CSRF;
- Origin;
- rate limit;
- session fallback;
- security audit.

Criar matriz completa:

```text
recurso
ação
Administrador
Gestão
Financeiro
Comercial
Operacional
ownership
```

Definir todas as permissões usadas em telas, APIs e rastreabilidade.

---

# 22. CACHE, FILAS E JOBS

O DOC-11 deve definir:

- cache catalog;
- key naming;
- TTL;
- invalidation;
- stampede protection;
- fallback;
- Redis outage behavior;
- BullMQ;
- filas;
- jobs;
- retries;
- DLQ;
- idempotency;
- concurrency;
- timeout;
- retention;
- replay;
- metrics.

Todos os JOB-IDs e QUEUE-IDs usados em qualquer documento devem estar definidos aqui.

---

# 23. ARQUIVOS

O DOC-12 deve definir filesystem privado abstraído.

Incluir:

- paths;
- volumes;
- metadata;
- checksum;
- MIME;
- size;
- extension;
- filename normalization;
- path traversal;
- authorization;
- download endpoint;
- streaming;
- temporary access;
- versioning;
- retention;
- deletion;
- backup;
- restore;
- PDF;
- image;
- Office documents;
- ZIP policy;
- malware scanning strategy.

MinIO somente como evolução.

---

# 24. N8N, IA E EXTERNOS

O DOC-13 deve definir:

## n8n

- backend chama n8n;
- n8n não lê banco diretamente;
- webhook HMAC;
- timestamp;
- nonce;
- idempotency;
- correlation ID;
- timeout;
- retry;
- circuit breaker;
- outbox;
- callback inbox;
- audit.

## IA

- Ollama provider;
- queue;
- worker;
- allowed tasks;
- privacy;
- timeout;
- cancellation;
- token/input limits;
- output validation;
- prompt versioning;
- audit;
- degraded mode;
- no paid fallback.

## SMTP

- abstraction;
- Mailpit dev;
- configurable SMTP prod;
- retries;
- delivery log;
- no provider mandatory.

Não inventar integração ativa que esteja fora do escopo.

---

# 25. INFRAESTRUTURA

O DOC-14 deve usar:

```text
Docker Compose
Caddy
PostgreSQL
PgBouncer
Redis
API
Worker
Web
Prometheus
Grafana
Loki
pgBackRest
restic
```

Considerar existentes:

```text
n8n
Qdrant
Ollama
```

Incluir:

- topology;
- networks;
- ports;
- firewall;
- SSH;
- TLS;
- DNS;
- volumes;
- secrets;
- user permissions;
- container policies;
- resource budget;
- health;
- readiness;
- backups;
- controlled deployment;
- rollback;
- staging;
- production.

Não apresentar compose de produção como código final.

Pode usar pseudoconfiguração.

Não prometer zero downtime.

---

# 26. OBSERVABILIDADE

O DOC-15 deve definir:

- Pino JSON;
- request ID;
- correlation ID;
- Prometheus;
- Grafana;
- Loki;
- OpenTelemetry instrumentation;
- no persistent trace backend initial;
- metrics;
- dashboards;
- alerts;
- retention;
- cardinality;
- redaction;
- security events;
- slow queries;
- queue age;
- disk;
- backup;
- availability.

Todos os OBS-IDs e SLO-IDs devem ser definidos.

---

# 27. PERFORMANCE

O DOC-16 deve usar as metas congeladas.

Definir cenários k6:

- login;
- dashboard;
- list clients;
- create client;
- lead pipeline;
- task update;
- financial write;
- file upload;
- queue enqueue.

Definir:

- dataset;
- concurrency;
- duration;
- warm-up;
- P50;
- P95;
- P99;
- throughput;
- errors;
- CPU;
- memory;
- connections;
- disk I/O;
- queue latency;
- pass/fail.

Não usar benchmark promocional do Fastify como capacidade.

---

# 28. TESTES

O DOC-17 deve definir ao menos um TEST-ID para cada FR no escopo.

FRs fora de escopo devem possuir teste marcado:

```text
NOT_APPLICABLE_INITIAL
```

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
stress
soak
failure
backup restore
```

Cada teste:

```text
TEST-ID
FR
BR
type
precondition
scenario
steps
expected
negative cases
evidence
gate
```

Cobrir:

- auth;
- session;
- CSRF;
- RBAC;
- ownership;
- finance concurrency;
- idempotency;
- outbox;
- queue retry;
- DLQ;
- Redis outage;
- DB outage;
- n8n outage;
- Ollama outage;
- upload security;
- backup restore;
- rollback;
- accessibility;
- mobile;
- performance.

Todos os TEST-IDs usados em qualquer documento devem estar definidos aqui.

---

# 29. AMBIENTES E BOOTSTRAP

O DOC-18 deve definir:

```text
development
test
staging
production
```

Incluir:

- config schema;
- names of env vars;
- no secret values;
- startup validation;
- seed roles;
- seed permissions;
- bootstrap admin;
- mandatory password change;
- demo data only in dev/staging;
- production reset prohibited;
- feature flags;
- environment parity;
- Mailpit dev;
- isolated test DB.

---

# 30. BACKUP E DR

O DOC-19 deve definir:

- pgBackRest;
- WAL;
- full;
- differential;
- S3-compatible offsite;
- restic files;
- configs;
- secret backup encrypted;
- retention;
- verification;
- restore test;
- RPO;
- RTO;
- DB corruption;
- disk loss;
- VPS loss;
- backup failure;
- restore runbook.

Não afirmar DR com backup no mesmo host.

---

# 31. CI/CD

O DOC-20 deve definir:

- branches;
- commits;
- PR;
- versioning;
- GitHub Actions;
- lint;
- typecheck;
- tests;
- security scans;
- build;
- immutable images;
- GHCR;
- staging;
- migrations;
- smoke;
- manual production approval;
- controlled deployment;
- rollback;
- changelog;
- release notes.

Não prometer blue-green inicial.

---

# 32. ROADMAP CODEX

O DOC-21 deve possuir fases sequenciais:

```text
PHASE-000 leitura e validação documental
PHASE-001 novo repositório
PHASE-002 monorepo
PHASE-003 desenvolvimento local
PHASE-004 infraestrutura local
PHASE-005 PostgreSQL e migrations
PHASE-006 auth e sessões
PHASE-007 RBAC
PHASE-008 backend foundation
PHASE-009 frontend foundation
PHASE-010 clientes
PHASE-011 leads e CRM
PHASE-012 reuniões
PHASE-013 serviços
PHASE-014 propostas e contratos
PHASE-015 projetos e tarefas
PHASE-016 financeiro
PHASE-017 marketing
PHASE-018 notificações
PHASE-019 arquivos
PHASE-020 filas e automações
PHASE-021 n8n
PHASE-022 IA
PHASE-023 auditoria
PHASE-024 observabilidade
PHASE-025 segurança
PHASE-026 performance
PHASE-027 staging
PHASE-028 homologação
PHASE-029 produção
PHASE-030 estabilização
```

Para cada fase:

```text
objective
inputs
tasks
files
deliverables
tests
gate
rollback
blocked conditions
definition of done
```

O Codex não pode pular gates.

---

# 33. MATRIZ DE RASTREABILIDADE

O DOC-22 deve conter linha para todos os 56 FRs.

Colunas:

```text
FR
classification
module
BR
SCR
API
DB
permission
event
job
TEST
PHASE
GATE
status
```

Regras:

- todos os 56 FRs presentes;
- nenhum FR duplicado com conflito;
- FR fora de escopo com `NOT_APPLICABLE_INITIAL`;
- toda referência deve existir no documento canônico correspondente;
- nenhum ID inventado apenas na matriz;
- nenhum endpoint órfão;
- nenhuma tabela órfã;
- nenhum teste órfão;
- nenhuma permissão órfã.

---

# 34. ADRs

O DOC-23 deve conter no mínimo:

```text
ADR-001 modular monolith
ADR-002 React Vite
ADR-003 NestJS Fastify
ADR-004 pnpm Turborepo
ADR-005 PostgreSQL
ADR-006 Drizzle
ADR-007 opaque sessions
ADR-008 PostgreSQL session source
ADR-009 RBAC ownership
ADR-010 Redis
ADR-011 BullMQ
ADR-012 private filesystem
ADR-013 Caddy
ADR-014 Docker Compose
ADR-015 Prometheus Grafana Loki
ADR-016 pgBackRest restic
ADR-017 n8n boundary
ADR-018 Ollama provider
ADR-019 single organization
ADR-020 single VPS limitation
ADR-021 controlled deployment
ADR-022 GitHub Actions GHCR
```

Cada ADR:

- context;
- options;
- criteria;
- decision;
- consequences;
- risks;
- revision trigger;
- official sources;
- URLs;
- access date.

Não usar fontes genéricas quando houver fonte oficial.

---

# 35. RISCOS E LACUNAS

O DOC-24 deve registrar:

- scope creep;
- function invention;
- documentation drift;
- RBAC error;
- financial concurrency;
- data loss;
- migration failure;
- disk full;
- memory pressure;
- queue stopped;
- Redis down;
- DB down;
- n8n down;
- Ollama down;
- Qdrant resource contention;
- backup invalid;
- restore failure;
- secret exposure;
- dependency vulnerability;
- single VPS;
- insufficient tests;
- file abuse;
- SMTP failure;
- legal assumptions.

Nenhuma decisão congelada deve permanecer bloqueada.

`DECISION_BLOCKED` somente para informação operacional que não impede o Codex de iniciar.

---

# 36. RUNBOOKS

O DOC-25 deve conter procedimentos para:

```text
deploy
rollback
migration
restore
PostgreSQL unavailable
Redis unavailable
queue blocked
worker failed
disk full
high CPU
high memory
slow query
TLS failure
secret rotation
user lockout
security incident
n8n unavailable
Ollama unavailable
Qdrant overload
VPS restart
VPS loss
SMTP failure
file volume failure
```

Cada runbook:

```text
symptom
impact
preconditions
diagnosis
commands category
action
validation
rollback
escalation
evidence
```

Não incluir secret real.

---

# 37. HANDOFF CODEX

O DOC-26 deve ser um contrato fechado.

Deve obrigar o Codex a:

- ler 00 a 28;
- verificar SHA-256;
- não acessar legado;
- não inventar requisito;
- não alterar ADR silenciosamente;
- trabalhar por fase;
- usar skills;
- usar subagentes;
- executar testes;
- atualizar rastreabilidade;
- registrar desvios;
- parar em bloqueio real;
- não pular gate;
- não fazer deploy sem backup;
- manter documentação atualizada.

Incluir prompt inicial completo para o Codex.

Não executar o prompt.

---

# 38. CHECKLIST DE ACEITE

O DOC-27 deve ter itens verificáveis para:

```text
product
UX
frontend
backend
database
API
auth
RBAC
security
files
queues
n8n
AI
finance
infra
observability
performance
tests
backup
CI/CD
deploy
documentation
handoff
```

Cada item:

```text
ID
requirement
method
evidence
pass condition
gate
```

---

# 39. RELATÓRIO DE CONSISTÊNCIA

O DOC-28 deve ser refeito somente após todos os documentos.

Não copiar o relatório atual.

Executar validação real.

Registrar:

- command;
- timestamp;
- counts;
- failures;
- corrections;
- final result.

Não declarar 100% sem comprovação.

---

# 40. VALIDAÇÃO AUTOMÁTICA OBRIGATÓRIA

Execute validação por script ou comandos.

O processo deve extrair IDs com regex.

Condições obrigatórias:

## 40.1 Arquivos

```text
EXACT_MARKDOWN_FILES = 29
EMPTY_FILES = 0
FILES_OUTSIDE_DOCS_CHANGED = 0
TEMP_FILES_IN_PROJECT = 0
```

## 40.2 Links

```text
FILE_URI_LINKS = 0
ABSOLUTE_WINDOWS_LINKS = 0
BROKEN_RELATIVE_LINKS = 0
```

Converter links para:

```text
./NOME-DO-DOCUMENTO.md
```

## 40.3 Requisitos

```text
FR_TOTAL = 56
FR_IN_TRACEABILITY = 56
FR_WITH_TEST = 56
FR_WITH_PHASE = 56
FR_WITH_GATE = 56
```

## 40.4 IDs

Nenhuma referência indefinida:

```text
UNDEFINED_FR = 0
UNDEFINED_BR = 0
UNDEFINED_SCR = 0
UNDEFINED_API = 0
UNDEFINED_DB = 0
UNDEFINED_PERMISSION = 0
UNDEFINED_EVENT = 0
UNDEFINED_JOB = 0
UNDEFINED_QUEUE = 0
UNDEFINED_TEST = 0
UNDEFINED_PHASE = 0
UNDEFINED_GATE = 0
UNDEFINED_ADR = 0
UNDEFINED_RISK = 0
```

## 40.5 Duplicidade

```text
CONFLICTING_DUPLICATE_IDS = 0
DUPLICATE_API_ROUTES_WITH_SAME_METHOD = 0
DUPLICATE_DB_TABLE_NAMES = 0
DUPLICATE_PERMISSION_KEYS = 0
```

## 40.6 Consistência

Procurar e eliminar:

```text
file:///
React 18/19
Authorization: Bearer
localStorage token
refresh token
MinIO como stack inicial
Super Admin global
multi-tenant inicial
organization_id obrigatório
0% de erro
30.000 req/s
2x mais rápido
<1ms garantido
zero-downtime inicial
Kubernetes inicial
TODO
TBD
PLACEHOLDER
A ou B
ou MinIO
JWT em browser
CODEX_READY = YES em documento não validado
```

## 40.7 Recursos

```text
RAM_SERVICE_LIMITS <= 41 GiB
RAM_RESERVED >= 12 GiB
RAM_TOTAL_PLANNED <= 53 GiB
QDRANT_INCLUDED = YES
N8N_INCLUDED = YES
OLLAMA_INCLUDED = YES
GPU_ASSUMED = NO
```

## 40.8 Readiness

`CODEX_READY = YES` somente se todos os critérios anteriores passarem.

---

# 41. CICLO INTERNO DE REPARO

Você deve trabalhar em ciclo interno, sem envolver o usuário:

```text
AUDIT
REWRITE
VALIDATE
IDENTIFY_FAILURES
REPAIR
REVALIDATE
```

Repetir até:

```text
ALL_VALIDATIONS_PASS = YES
```

Limite de repetição não deve ser usado como motivo para entregar pacote inválido.

Se houver erro técnico de ferramenta:

- tente abordagem alternativa;
- registre no DOC-28;
- continue;
- não peça instrução ao usuário.

---

# 42. REVISÃO POR SUBAGENTES

Use subagentes quando disponíveis:

```text
PRODUCT_REVIEWER
FRONTEND_REVIEWER
BACKEND_REVIEWER
DATABASE_REVIEWER
SECURITY_REVIEWER
DEVOPS_REVIEWER
QA_REVIEWER
TRACEABILITY_REVIEWER
FINAL_CONSISTENCY_REVIEWER
```

Cada revisor deve trabalhar read-only sobre os documentos.

Somente o agente principal escreve.

O revisor final não pode ser o mesmo subagente que redigiu a seção.

---

# 43. PROIBIÇÕES

Não:

```text
criar código
criar package.json
criar src
criar apps
criar packages
instalar pnpm
instalar Docker
criar banco
criar migrations reais
criar .env real
alterar VPS
fazer deploy
criar GitHub repo
fazer commit
fazer push
acessar legado
pedir confirmação
entregar relatório parcial
encerrar com validações falhando
```

---

# 44. STATUS DOS DOCUMENTOS

Os documentos técnicos podem usar:

```text
APPROVED_BY_ARCHITECTURE_AGENT
```

O DOC-02 não deve continuar `REVIEW_REQUIRED`, pois as decisões de produto foram congeladas por este prompt.

Use:

```text
APPROVED_FOR_CODEX_IMPLEMENTATION
```

somente após a validação final.

Nenhum documento deve alegar aprovação jurídica, contábil ou regulatória.

---

# 45. CONCLUSÃO E READINESS

No DOC-00 e DOC-28:

```text
DOCUMENTATION_COMPLETE = YES
PRODUCT_REQUIREMENTS_READY = YES
ARCHITECTURE_READY = YES
SECURITY_READY = YES
DATABASE_READY = YES
API_READY = YES
INFRASTRUCTURE_READY = YES
TEST_STRATEGY_READY = YES
TRACEABILITY_COMPLETE = YES
CODEX_HANDOFF_READY = YES
CODEX_READY = YES
```

Esses valores só podem ser escritos após todos os testes passarem.

Caso algum teste ainda falhe, você deve continuar corrigindo.

Não entregar `CODEX_READY = NO` por falta de decisão já resolvida neste prompt.

---

# 46. RESPOSTA FINAL OBRIGATÓRIA

Não apresente explicações longas.

Responda somente:

```text
PROJECT_ROOT =
DOCUMENTATION_ROOT =

FILES_EXPECTED = 29
FILES_REVIEWED =
FILES_REWRITTEN =
FILES_CREATED = 0
FILES_DELETED = 0
FILES_EMPTY =
TOTAL_LINES =
TOTAL_SIZE =
PACKAGE_SHA256_MANIFEST =

FR_TOTAL =
FR_TRACED =
FR_WITH_TEST =
FR_WITH_PHASE =
FR_WITH_GATE =
BR_TOTAL =
SCREENS_TOTAL =
API_ENDPOINTS_TOTAL =
DATABASE_ENTITIES_TOTAL =
PERMISSIONS_TOTAL =
EVENTS_TOTAL =
QUEUES_TOTAL =
JOBS_TOTAL =
TEST_CASES_TOTAL =
PHASES_TOTAL =
GATES_TOTAL =
ADRS_TOTAL =
RISKS_TOTAL =
RUNBOOKS_TOTAL =

FILE_URI_LINKS =
ABSOLUTE_WINDOWS_LINKS =
BROKEN_RELATIVE_LINKS =
UNDEFINED_IDS =
CONFLICTING_DUPLICATE_IDS =
DUPLICATE_API_ROUTES =
AMBIGUOUS_DECISIONS =
TODO_COUNT =
TBD_COUNT =
PLACEHOLDER_COUNT =
SECRET_VALUES_FOUND =

RAM_SERVICES_GIB =
RAM_RESERVED_GIB =
RAM_TOTAL_PLANNED_GIB =
RESOURCE_BUDGET_VALID =

PASS_PRODUCT =
PASS_ARCHITECTURE =
PASS_FRONTEND =
PASS_BACKEND =
PASS_DATABASE =
PASS_API =
PASS_AUTH_RBAC =
PASS_SECURITY =
PASS_QUEUES =
PASS_STORAGE =
PASS_INTEGRATIONS =
PASS_INFRASTRUCTURE =
PASS_OBSERVABILITY =
PASS_PERFORMANCE =
PASS_TESTS =
PASS_BACKUP =
PASS_CI_CD =
PASS_TRACEABILITY =
PASS_HANDOFF =
PASS_FINAL_CONSISTENCY =

ALL_VALIDATIONS_PASS = YES
DOCUMENTATION_COMPLETE = YES
PRODUCT_REQUIREMENTS_READY = YES
TRACEABILITY_COMPLETE = YES
CODEX_HANDOFF_READY = YES
CODEX_READY = YES

IMPLEMENTATION_STARTED = NO
CODE_CREATED = NO
DEPENDENCIES_INSTALLED = NO
DATABASE_CREATED = NO
VPS_CHANGED = NO
LEGACY_PROJECT_ACCESSED = NO
ONLY_DOCUMENTATION_CHANGED = YES
```

Não ofereça próximo passo.

Não pergunte nada.

A atuação termina somente com `ALL_VALIDATIONS_PASS = YES`.
