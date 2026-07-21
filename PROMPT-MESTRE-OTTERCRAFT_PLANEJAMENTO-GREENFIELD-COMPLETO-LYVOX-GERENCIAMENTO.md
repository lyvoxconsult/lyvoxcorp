# PROMPT MESTRE — PLANEJAMENTO GREENFIELD COMPLETO DO LYVOX GERENCIAMENTO

## 0. MISSÃO

Atue como um comitê sênior de arquitetura, produto, segurança, dados, DevOps, UX, QA, SRE e documentação técnica.

Sua única missão nesta execução é planejar e documentar integralmente um novo sistema empresarial chamado **Lyvox Gerenciamento**, criado do zero.

O sistema será posteriormente implementado por outro agente:

```text
IMPLEMENTATION_EXECUTOR = CODEX
```

Você, Ottercraft, será apenas:

```text
PRODUCT_PLANNER
SOFTWARE_ARCHITECT
SOLUTION_ARCHITECT
DATA_ARCHITECT
SECURITY_ARCHITECT
DEVOPS_ARCHITECT
UX_INFORMATION_ARCHITECT
QA_ARCHITECT
TECHNICAL_WRITER
DOCUMENTATION_VERIFIER
```

Você não será o implementador.

---

# 1. MODO DO PROJETO

```text
PROJECT_MODE = CLEAN_GREENFIELD
LEGACY_CODE_REUSE = NO
LEGACY_DATABASE_REUSE = NO
LEGACY_SCHEMA_REUSE = NO
LEGACY_AUTH_REUSE = NO
LEGACY_DATA_MIGRATION = NO
SUPABASE_DEPENDENCY = NO
FIREBASE_DEPENDENCY = NO
MANAGED_BACKEND_DEPENDENCY = NO
VERCEL_RUNTIME_DEPENDENCY = NO
IMPLEMENTATION_ALLOWED = NO
DOCUMENTATION_ONLY = YES
```

O projeto anterior não deve ser auditado, refatorado, copiado ou utilizado como fonte técnica.

Não pesquise arquivos do sistema legado.

Não copie código, schema, migrations, componentes, rotas ou configurações anteriores.

O novo sistema deve nascer limpo.

---

# 2. DIRETÓRIO DO PROJETO

Considere como `PROJECT_ROOT` a pasta de trabalho atualmente aberta no Ottercraft.

Crie toda a documentação somente em:

```text
<PROJECT_ROOT>\docs\planejamento\
```

Não crie código-fonte.

Não inicialize frameworks.

Não execute scaffolding.

Não instale dependências.

Não crie banco.

Não faça deploy.

Não altere VPS.

Não altere serviços externos.

A única alteração permitida é a criação e revisão dos arquivos Markdown definidos neste prompt.

---

# 3. OBJETIVO DO PACOTE DOCUMENTAL

Produzir um conjunto completo, coerente, rastreável e executável de documentos que permita ao Codex criar o sistema posteriormente sem:

- improvisar requisitos;
- inventar funcionalidades silenciosamente;
- alterar decisões arquiteturais;
- fugir de escopo;
- trabalhar sem critérios de aceite;
- escolher tecnologias sem justificativa;
- misturar regras de negócio com infraestrutura;
- executar etapas fora de ordem;
- criar código antes das fundações;
- ignorar segurança, backup, testes ou observabilidade.

Ao final, o Codex deve conseguir entender:

```text
o que será construído
por que será construído
quais áreas existirão
quais funções cada área terá
quais funções não existirão
como o sistema será estruturado
qual stack será usada
como frontend e backend se comunicam
como os dados serão modelados
como autenticação e permissões funcionarão
como arquivos serão armazenados
como filas e jobs funcionarão
como n8n e IA serão integrados
como o sistema será testado
como será implantado na VPS
como será monitorado
como será recuperado após falhas
qual é a ordem exata de implementação
quais gates bloqueiam avanço
qual é a definição objetiva de pronto
```

---

# 4. REQUISITOS CONFIRMADOS PELO USUÁRIO

Trate os itens abaixo como requisitos confirmados:

```text
REQ-CONF-001 = sistema empresarial criado integralmente do zero
REQ-CONF-002 = hospedagem em VPS própria
REQ-CONF-003 = controle total da infraestrutura
REQ-CONF-004 = PostgreSQL e backend self-hosted
REQ-CONF-005 = não usar Supabase, Firebase ou BaaS equivalente
REQ-CONF-006 = arquitetura robusta, escalável e de alta performance
REQ-CONF-007 = preparada para milhares de usuários
REQ-CONF-008 = baixa latência e integridade de dados
REQ-CONF-009 = segurança por padrão
REQ-CONF-010 = observabilidade e deploy previsível
REQ-CONF-011 = redução de dependências externas
REQ-CONF-012 = integração com n8n local
REQ-CONF-013 = possibilidade de IA local via Ollama
REQ-CONF-014 = Codex será o executor da implementação
REQ-CONF-015 = Ottercraft somente planeja e documenta
REQ-CONF-016 = nenhuma implementação nesta fase
REQ-CONF-017 = documentação completa antes do início do código
```

Contexto conhecido da infraestrutura, que deve ser validado em modo read-only quando houver acesso:

```text
VPS_OS = Ubuntu
VPS_CPU_REFERENCE = 16 vCPU
VPS_RAM_REFERENCE = aproximadamente 62 GiB
VPS_GPU = nenhuma GPU dedicada conhecida
EXISTING_SERVICES = n8n, Qdrant, Ollama
```

Se não for possível verificar a VPS:

```text
VPS_LIVE_AUDIT = NOT_AVAILABLE
```

Não invente o estado da VPS.

---

# 5. CLASSIFICAÇÃO OBRIGATÓRIA DE INFORMAÇÃO

Toda afirmação relevante nos documentos deve ser classificada como uma destas categorias:

```text
USER_CONFIRMED
ARCHITECTURAL_DECISION
PROPOSED_PRODUCT_REQUIREMENT
ASSUMPTION
UNKNOWN
OUT_OF_SCOPE
DECISION_BLOCKED
```

Definições:

## USER_CONFIRMED

Informação explicitamente definida neste prompt.

## ARCHITECTURAL_DECISION

Decisão técnica tomada após comparação objetiva e pesquisa em fontes oficiais.

## PROPOSED_PRODUCT_REQUIREMENT

Função de produto proposta pelo comitê para completar um fluxo empresarial.

Não deve ser apresentada como pedido explícito do usuário.

## ASSUMPTION

Hipótese conservadora usada para permitir o planejamento.

Deve informar impacto e critério de validação.

## UNKNOWN

Informação não disponível e que não pode ser deduzida com segurança.

## OUT_OF_SCOPE

Item deliberadamente excluído.

## DECISION_BLOCKED

Decisão impossível sem uma informação crítica.

Deve informar:

```text
informação ausente
impacto
alternativas
default conservador
momento limite para decidir
```

Não esconda incertezas.

Não transforme hipótese em fato.

---

# 6. POLÍTICA CONTRA ALUCINAÇÃO

É proibido:

- afirmar que uma função foi solicitada quando foi apenas proposta;
- afirmar que uma integração existe sem evidência;
- inventar API de terceiro;
- inventar limitações ou capacidades de frameworks;
- escolher tecnologia com base somente em benchmark promocional;
- criar números de performance como garantia;
- afirmar alta disponibilidade real em uma VPS única;
- inventar política empresarial;
- inventar regra fiscal, jurídica ou contábil;
- criar fluxo financeiro sem integridade transacional;
- esconder dependências;
- inventar custos;
- declarar uma decisão como aprovada pelo usuário;
- usar blogs genéricos como única evidência técnica;
- deixar contradições entre documentos;
- criar documentos vazios ou genéricos.

Quando uma solução não existir ou não for viável, documente claramente:

```text
NO_VALID_SOLUTION_FOUND
```

Explique a limitação.

---

# 7. POLÍTICA DE PERGUNTAS E AUTONOMIA

Não faça perguntas durante a execução.

Não interrompa para pedir autorização.

Não pergunte se deve continuar.

Quando faltar informação:

1. registre `UNKNOWN` ou `DECISION_BLOCKED`;
2. adote um default conservador somente quando isso não gerar risco;
3. classifique o default como `ASSUMPTION`;
4. registre o ponto de revisão;
5. continue a documentação.

Ao final, consolide todas as lacunas em um único documento.

---

# 8. PESQUISA TÉCNICA OBRIGATÓRIA

Pesquise versões, compatibilidade, segurança e operação utilizando prioritariamente:

```text
documentação oficial
repositórios oficiais
especificações formais
OWASP
PostgreSQL documentation
Node.js documentation
framework documentation
OpenTelemetry documentation
Docker documentation
Linux/systemd documentation
```

Pesquise e compare, no mínimo:

```text
React + Vite
Next.js
NestJS + Fastify
Fastify puro
Go
Spring Boot
PostgreSQL
Drizzle
Prisma
Kysely
SQL explícito
Redis
BullMQ
RabbitMQ
Keycloak
Ory
autenticação própria
Docker Compose
systemd
k3s
Nomad
Nginx
Caddy
Traefik
HAProxy
MinIO
filesystem privado abstraído
OpenTelemetry
Prometheus
Grafana
Loki
Tempo
pgBackRest
PgBouncer
k6
Playwright
Vitest
```

Para cada decisão:

```text
opções avaliadas
critérios
vantagens
limitações
custo operacional
risco
decisão final
fonte oficial
gatilho de revisão
```

O documento final não pode terminar com “A ou B”.

Escolha uma solução.

Use `DECISION_BLOCKED` apenas quando realmente necessário.

---

# 9. PRINCÍPIO ARQUITETURAL

Avalie:

```text
monólito tradicional
monólito modular
modulith
microsserviços
```

O sistema deve começar com a alternativa de menor complexidade operacional que preserve:

```text
separação de domínios
integridade transacional
baixo acoplamento
testabilidade
escalabilidade horizontal futura
extração futura de serviços
```

Microsserviços não devem ser escolhidos apenas por previsão de milhares de usuários.

A escolha final deve ser registrada em ADR.

---

# 10. ESCOPO FUNCIONAL BASE

Planeje os módulos abaixo como baseline inicial.

Não adicione novos módulos de negócio fora desta lista sem classificar como `PROPOSED_PRODUCT_REQUIREMENT`.

## 10.1 Identidade e acesso

- login;
- logout;
- recuperação de senha;
- alteração de senha;
- sessões;
- dispositivos e sessões ativas;
- bloqueio;
- reativação;
- MFA para administradores;
- usuários;
- cargos;
- permissões;
- auditoria de segurança.

## 10.2 Dashboard

- visão geral;
- indicadores;
- pendências;
- atividades recentes;
- atalhos;
- métricas por permissão.

## 10.3 Clientes

- cadastro;
- contatos;
- documentos;
- histórico;
- responsáveis;
- status;
- busca;
- filtros;
- vínculo com propostas, projetos, reuniões e financeiro.

## 10.4 Leads e CRM

- cadastro;
- pipeline;
- etapas;
- origem;
- responsável;
- notas;
- histórico;
- follow-up;
- agenda;
- templates;
- cadências;
- importação;
- captura;
- conversão em cliente;
- métricas.

## 10.5 Reuniões

- cadastro;
- agenda;
- participantes;
- pauta;
- notas;
- anexos;
- transcrição;
- análise por IA;
- tarefas originadas;
- vínculo com cliente, lead, proposta ou projeto.

## 10.6 Serviços e valores

- categorias;
- catálogo;
- preço;
- cobrança única ou recorrente;
- condições;
- status;
- versionamento de preço;
- configurações.

## 10.7 Propostas e contratos

- criação;
- itens;
- descontos;
- recorrência;
- validade;
- status;
- aprovação;
- geração de PDF;
- histórico;
- contrato derivado;
- cancelamento;
- auditoria.

Não invente assinatura digital juridicamente vinculante sem classificar e pesquisar.

## 10.8 Projetos e tarefas

- projetos;
- responsáveis;
- participantes;
- status;
- prioridade;
- datas;
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

## 10.9 Financeiro

- receitas;
- despesas;
- contas a receber;
- contas a pagar;
- categorias;
- competência;
- vencimento;
- pagamento;
- recorrência;
- vínculo com cliente, proposta, contrato ou projeto;
- fluxo de caixa;
- relatórios;
- auditoria.

Não invente integração bancária.

Não invente emissão fiscal.

## 10.10 Marketing

- planejamento;
- ideias;
- calendário editorial;
- posts;
- campanhas;
- kit de marca;
- geração assistida por IA;
- revisão;
- exportação;
- publicação somente quando houver integração real.

## 10.11 Automações

- automações;
- triggers;
- condições;
- ações;
- execução manual;
- agendamento;
- histórico;
- retries;
- falhas;
- integração com n8n;
- variáveis;
- templates;
- auditoria.

## 10.12 Notificações

- internas;
- lidas e não lidas;
- prioridade;
- destino;
- preferências;
- eventos do sistema;
- links contextuais.

## 10.13 Arquivos e documentos

- upload;
- download;
- metadados;
- autorização;
- versionamento;
- checksum;
- retenção;
- anexos;
- PDFs;
- documentos de clientes;
- documentos de projetos;
- propostas e contratos.

## 10.14 Configurações

- empresa;
- branding;
- preferências;
- parâmetros por módulo;
- integrações;
- segurança;
- notificações;
- IA;
- armazenamento.

## 10.15 Assistente e IA

- geração assistida;
- análise;
- fila;
- histórico;
- provider abstraction;
- Ollama;
- limites;
- segurança;
- operação degradada sem IA.

## 10.16 Auditoria

- ações sensíveis;
- autenticação;
- alterações de dados;
- mudanças de permissão;
- documentos;
- financeiro;
- automações;
- integrações;
- exportações.

---

# 11. FORA DO ESCOPO INICIAL

Classifique inicialmente como `OUT_OF_SCOPE`, salvo decisão fundamentada:

```text
aplicativo mobile nativo
microserviços
Kubernetes
service mesh
Kafka
event sourcing integral
CQRS integral
blockchain
assinatura digital qualificada
emissão fiscal
integração bancária
folha de pagamento
contabilidade completa
CRM externo
ERP externo
marketplace
multi-região
cluster multi-datacenter
```

Capacidades futuras podem ser documentadas como roadmap, sem implementação inicial.

---

# 12. DOCUMENTOS OBRIGATÓRIOS

Crie exatamente esta estrutura:

```text
docs/
└── planejamento/
    ├── 00-INDICE-MESTRE-E-STATUS.md
    ├── 01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md
    ├── 02-REQUISITOS-FUNCIONAIS-E-REGRAS-DE-NEGOCIO.md
    ├── 03-ARQUITETURA-DE-INFORMACAO-TELAS-E-NAVEGACAO.md
    ├── 04-UX-DESIGN-SYSTEM-E-ACESSIBILIDADE.md
    ├── 05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md
    ├── 06-ARQUITETURA-FRONTEND.md
    ├── 07-ARQUITETURA-BACKEND.md
    ├── 08-MODELAGEM-POSTGRESQL-E-DICIONARIO-DE-DADOS.md
    ├── 09-CONTRATOS-API-REST-E-OPENAPI.md
    ├── 10-AUTENTICACAO-RBAC-E-SEGURANCA.md
    ├── 11-CACHE-FILAS-WORKERS-E-JOBS.md
    ├── 12-ARQUIVOS-DOCUMENTOS-E-STORAGE.md
    ├── 13-INTEGRACOES-N8N-IA-E-SERVICOS-EXTERNOS.md
    ├── 14-INFRAESTRUTURA-VPS-REDE-E-DEPLOY.md
    ├── 15-OBSERVABILIDADE-SRE-SLI-SLO-E-ALERTAS.md
    ├── 16-PERFORMANCE-CAPACIDADE-E-ESCALABILIDADE.md
    ├── 17-ESTRATEGIA-DE-TESTES-QA-E-HOMOLOGACAO.md
    ├── 18-AMBIENTES-CONFIGURACOES-SEEDS-E-BOOTSTRAP.md
    ├── 19-BACKUP-RESTORE-DR-E-CONTINUIDADE.md
    ├── 20-CI-CD-VERSIONAMENTO-RELEASE-E-ROLLBACK.md
    ├── 21-ROADMAP-DE-IMPLEMENTACAO-PARA-CODEX.md
    ├── 22-MATRIZ-DE-RASTREABILIDADE.md
    ├── 23-ADRS-DECISOES-ARQUITETURAIS.md
    ├── 24-RISCOS-PREMISSAS-LACUNAS-E-DECISOES-BLOQUEADAS.md
    ├── 25-RUNBOOKS-OPERACIONAIS.md
    ├── 26-HANDOFF-EXECUTIVO-PARA-CODEX.md
    ├── 27-CHECKLIST-MESTRE-DE-ACEITE.md
    └── 28-RELATORIO-FINAL-DE-CONSISTENCIA.md
```

Não crie arquivos temporários.

Não crie `PART1`, `PART2` ou rascunhos.

Escreva diretamente nos arquivos finais.

---

# 13. PADRÃO DE CADA DOCUMENTO

Todo arquivo deve começar com:

```text
Título
Documento ID
Versão
Status
Data
Responsável
Classificação
Documentos dependentes
Fontes consultadas
```

Status permitidos:

```text
DRAFT
REVIEW_REQUIRED
APPROVED_BY_ARCHITECTURE_AGENT
DECISION_BLOCKED
```

Nenhum documento pode ser marcado como aprovado pelo usuário.

Use:

```text
APPROVED_BY_ARCHITECTURE_AGENT
```

para decisões técnicas fechadas pelo Ottercraft.

Use:

```text
REVIEW_REQUIRED
```

para requisitos de produto propostos.

---

# 14. IDENTIFICADORES DE RASTREABILIDADE

Use IDs únicos:

```text
REQ-CONF-###   requisito confirmado
FR-###         requisito funcional
BR-###         regra de negócio
NFR-###        requisito não funcional
UX-###         requisito de UX
A11Y-###       acessibilidade
SEC-###        segurança
AUTH-###       autenticação
RBAC-###       autorização
DB-###         entidade ou regra de dados
API-###        endpoint
EVENT-###      evento
JOB-###        job
QUEUE-###      fila
FILE-###       arquivos
INT-###        integração
OBS-###        observabilidade
SLO-###        objetivo de serviço
PERF-###       performance
TEST-###       teste
RISK-###       risco
ADR-###        decisão arquitetural
OPS-###        operação
PHASE-###      fase de implementação
GATE-###       gate
```

Todos os IDs devem aparecer na matriz de rastreabilidade.

---

# 15. DOCUMENTO 00 — ÍNDICE MESTRE E STATUS

Deve conter:

- visão do pacote documental;
- lista de todos os documentos;
- status;
- versão;
- dependências;
- decisões bloqueadas;
- requisitos propostos pendentes de revisão;
- stack final resumida;
- roadmap resumido;
- gates;
- readiness para Codex;
- links relativos válidos.

Criar tabela:

| Documento | Objetivo | Status | Bloqueios | Link |
|---|---|---|---|---|

Criar resumo:

```text
DOCUMENTATION_COMPLETE
PRODUCT_REQUIREMENTS_READY
ARCHITECTURE_READY
SECURITY_READY
DATABASE_READY
API_READY
INFRASTRUCTURE_READY
TEST_STRATEGY_READY
CODEX_HANDOFF_READY
IMPLEMENTATION_ALLOWED
```

`IMPLEMENTATION_ALLOWED` deve permanecer `NO` nesta fase.

---

# 16. DOCUMENTO 01 — VISÃO, ESCOPO E PRINCÍPIOS

Definir:

- problema;
- objetivos;
- usuários;
- atores;
- valor;
- limites;
- escopo inicial;
- fora de escopo;
- princípios;
- requisitos confirmados;
- requisitos propostos;
- premissas;
- restrições;
- definição do MVP empresarial;
- definição de versões futuras.

Não invente persona detalhada sem classificar como proposta.

---

# 17. DOCUMENTO 02 — REQUISITOS FUNCIONAIS

Para cada módulo, documentar:

```text
objetivo
atores
telas
funções
ações
entradas
saídas
estados
regras
validações
permissões
eventos
notificações
arquivos
integrações
erros
estados vazios
critérios de aceite
fora de escopo
```

Cada função deve ter FR-ID.

Cada regra deve ter BR-ID.

Tabela mínima:

| ID | Módulo | Função | Classificação | Ator | Regra | Permissão | Dados | Critério de aceite |
|---|---|---|---|---|---|---|---|---|

Não escrever “CRUD” sem detalhar:

```text
criar
visualizar
editar
arquivar
excluir
restaurar
listar
filtrar
buscar
exportar
```

---

# 18. DOCUMENTO 03 — TELAS E NAVEGAÇÃO

Criar mapa completo de telas:

```text
login
recuperação
dashboard
clientes
leads
reuniões
serviços
propostas
contratos
projetos
tarefas
financeiro
marketing
automações
notificações
usuários
cargos
permissões
configurações
auditoria
IA
arquivos
```

Para cada tela:

```text
SCREEN-ID
rota
objetivo
atores
permissões
componentes
dados
ações
modais
estados
erros
responsividade
links
```

Criar:

- sitemap;
- árvore de navegação;
- rotas;
- breadcrumbs;
- menu desktop;
- navegação mobile;
- busca global;
- deep links;
- redirects;
- página 403;
- página 404;
- página 500;
- maintenance mode.

Incluir diagramas Mermaid.

---

# 19. DOCUMENTO 04 — UX E DESIGN SYSTEM

Definir:

- princípios visuais;
- estética premium empresarial;
- hierarquia;
- grid;
- breakpoints;
- tipografia;
- cores;
- tokens;
- espaçamentos;
- bordas;
- elevação;
- ícones;
- componentes;
- formulários;
- tabelas;
- feedback;
- estados;
- responsividade;
- acessibilidade;
- teclado;
- foco;
- contraste;
- loading;
- skeleton;
- empty state;
- error state;
- success state;
- redução de movimento;
- internacionalização futura.

Definir catálogo de componentes sem gerar código.

Criar critérios WCAG aplicáveis.

---

# 20. DOCUMENTO 05 — ARQUITETURA GERAL E STACK

Comparar e decidir:

```text
arquitetura
frontend
backend
monorepo
package manager
banco
data access
auth
sessões
cache
fila
storage
proxy
deploy
observabilidade
backup
testes
```

Entregar decisão final única.

Incluir:

- diagrama de contexto;
- container diagram;
- deployment diagram;
- fluxo de request;
- fluxo assíncrono;
- boundaries;
- dependências permitidas;
- dependências proibidas;
- estratégia de escala;
- custo operacional;
- limites de VPS única.

Declarar:

```text
UMA VPS NÃO OFERECE ALTA DISPONIBILIDADE REAL DO HOST
```

Separar resiliência de processo de alta disponibilidade física.

---

# 21. DOCUMENTO 06 — FRONTEND

Definir:

- framework;
- build;
- TypeScript;
- estrutura de pastas;
- feature modules;
- routing;
- layouts;
- state management;
- server state;
- API client;
- contratos;
- cache de frontend;
- formulários;
- validação;
- autorização visual;
- design system;
- acessibilidade;
- performance;
- lazy loading;
- code splitting;
- error boundary;
- logging;
- testes;
- convenções;
- lint;
- format;
- imports;
- tratamento de datas;
- moeda;
- timezone;
- arquivos;
- upload;
- download;
- segurança do browser.

Incluir árvore completa proposta do frontend.

Definir o que não pode ficar no frontend:

```text
regras críticas
secrets
acesso ao banco
autorização definitiva
operações financeiras
administração de usuários privilegiada
```

---

# 22. DOCUMENTO 07 — BACKEND

Definir:

- framework;
- runtime;
- estrutura modular;
- camadas;
- domínio;
- aplicação;
- infraestrutura;
- interfaces;
- controllers;
- use cases;
- repositories;
- transactions;
- validation;
- error model;
- logging;
- correlation ID;
- idempotency;
- rate limiting;
- security;
- permissions;
- audit;
- graceful shutdown;
- health;
- readiness;
- jobs;
- integrations;
- tests;
- conventions.

Incluir árvore completa proposta do backend.

Para cada módulo:

```text
domain
application
infrastructure
http
tests
```

Definir dependências entre módulos.

Proibir acesso direto às tabelas internas de outro módulo sem contrato.

---

# 23. DOCUMENTO 08 — POSTGRESQL E DICIONÁRIO DE DADOS

Criar modelagem greenfield completa.

Definir:

- schemas;
- tabelas;
- colunas;
- tipos;
- PK;
- FK;
- UNIQUE;
- CHECK;
- NOT NULL;
- índices;
- índices compostos;
- índices parciais;
- enums ou lookup tables;
- timestamps;
- soft delete;
- version;
- audit fields;
- tenant/organization strategy;
- transações;
- isolation;
- locks;
- optimistic concurrency;
- outbox;
- inbox;
- idempotency;
- retention;
- archival.

Criar ERD Mermaid.

Para cada tabela:

| DB-ID | Tabela | Objetivo | Coluna | Tipo | Constraint | Índice | Regra | Módulo |
|---|---|---|---|---|---|---|---|---|

Definir migrations:

```text
naming
versioning
expand/contract
rollback policy
seed policy
test database
```

Não copiar schema legado.

---

# 24. DOCUMENTO 09 — API REST E OPENAPI

Definir:

```text
/api/v1
REST
JSON
OpenAPI
versionamento
error envelope
cursor pagination
filter
sort
search
idempotency key
correlation ID
ETag
rate limit
timeout
request limits
file upload
```

Para cada endpoint:

| API-ID | Método | Rota | Módulo | Auth | Permissão | Request | Response | Erros | Transação | Cache | Auditoria |
|---|---|---|---|---|---|---|---|---|---|---|---|

Cobrir todas as funções do documento 02.

Não deixar função sem endpoint, evento ou justificativa de execução local.

---

# 25. DOCUMENTO 10 — AUTH, RBAC E SEGURANÇA

Definir:

- autenticação;
- login;
- logout;
- sessão;
- rotação;
- revogação;
- recuperação;
- MFA;
- password policy;
- lockout;
- brute force;
- dispositivos;
- sessões ativas;
- impersonation, inicialmente fora do escopo;
- RBAC;
- permissões;
- ownership;
- organization scope;
- deny by default;
- audit;
- privileged actions;
- admin bootstrap.

Comparar:

```text
auth própria
Keycloak
Ory
```

Escolher uma.

Criar threat model:

```text
XSS
CSRF
SQL injection
SSRF
IDOR
broken access control
credential stuffing
session fixation
file upload
secret exposure
supply chain
insider threat
backup exposure
log exposure
```

Criar permission matrix.

---

# 26. DOCUMENTO 11 — CACHE, FILAS E JOBS

Definir:

- Redis;
- cache;
- TTL;
- keys;
- invalidação;
- stampede;
- sessões, caso escolhido;
- rate limit;
- locks;
- BullMQ ou alternativa;
- filas;
- retries;
- backoff;
- DLQ;
- dedupe;
- idempotência;
- concurrency;
- timeouts;
- retention;
- replay;
- dashboard operacional;
- métricas.

Para cada job:

| JOB-ID | Fila | Producer | Consumer | Payload | Timeout | Retry | Idempotência | DLQ | Métricas |
|---|---|---|---|---|---|---|---|---|---|

---

# 27. DOCUMENTO 12 — ARQUIVOS E STORAGE

Comparar e decidir:

```text
filesystem privado abstraído
MinIO
```

Definir:

- uploads;
- metadata;
- checksum;
- MIME;
- tamanho;
- antivírus ou validação;
- autorização;
- download;
- streaming;
- versionamento;
- retenção;
- descarte;
- backup;
- restore;
- PDFs;
- imagens;
- anexos;
- documentos privados;
- path traversal;
- nomes seguros.

Não servir arquivo privado diretamente pelo proxy.

---

# 28. DOCUMENTO 13 — N8N, IA E EXTERNOS

## n8n

Definir:

- responsabilidade;
- limites;
- API autenticada;
- webhook assinado;
- outbox;
- idempotência;
- retry;
- DLQ;
- correlation ID;
- audit;
- circuit breaker.

Proibir n8n como fonte de verdade.

Proibir regra empresarial crítica existir somente em workflow.

## IA

Definir:

- provider abstraction;
- Ollama;
- modelos;
- fila;
- worker;
- timeout;
- cancellation;
- status;
- audit;
- limites;
- privacy;
- fallback;
- operação sem IA.

O sistema principal deve continuar funcional sem IA.

## Externos

Toda integração externa deve conter:

```text
status
contrato
auth
timeout
retry
rate limit
fallback
circuit breaker
secrets
observabilidade
```

---

# 29. DOCUMENTO 14 — VPS, REDE E DEPLOY

Auditar VPS em modo read-only quando disponível.

Definir:

- topologia inicial;
- portas;
- firewall;
- SSH;
- usuário de serviço;
- rede interna;
- reverse proxy;
- TLS;
- DNS;
- containers ou systemd;
- volumes;
- secrets;
- resource limits;
- health;
- readiness;
- restart;
- graceful shutdown;
- staging;
- production;
- deploy;
- rollback.

Comparar:

```text
Docker Compose
systemd
k3s
Nomad
```

Escolher uma solução inicial.

Criar orçamento:

| Serviço | CPU | RAM | Disco | I/O | Conexões | Limite |
|---|---:|---:|---:|---|---:|---|

Considerar n8n, Qdrant e Ollama existentes.

---

# 30. DOCUMENTO 15 — OBSERVABILIDADE E SRE

Definir:

- logs JSON;
- request ID;
- correlation ID;
- metrics;
- tracing;
- health;
- readiness;
- uptime;
- slow queries;
- queues;
- disk;
- backups;
- security events;
- dashboards;
- alerts;
- retention;
- cardinality;
- sampling.

Definir SLI/SLO:

```text
availability
latency
error rate
job success
queue age
backup success
restore readiness
```

Não prometer SLO sem plano de medição.

---

# 31. DOCUMENTO 16 — PERFORMANCE E ESCALA

Definir metas de referência, não garantias:

```text
10.000 usuários cadastrados
500 sessões simultâneas
100 requests/s sustentadas
```

Definir:

- P50/P95/P99;
- API latency;
- query latency;
- upload;
- jobs;
- connection pool;
- cache;
- indexes;
- pagination;
- N+1;
- load;
- stress;
- soak;
- profiling;
- capacity planning.

Criar níveis:

```text
Nível 0 desenvolvimento
Nível 1 VPS única
Nível 2 banco dedicado
Nível 3 APIs horizontais
Nível 4 HA multi-VPS
Nível 5 extração de serviços
```

Para cada nível:

```text
gatilho
mudança
risco
custo
pré-requisito
```

---

# 32. DOCUMENTO 17 — TESTES E QA

Definir pirâmide:

```text
unit
integration
database
contract
API
security
RBAC
E2E
accessibility
responsive
load
stress
soak
failure
backup restore
```

Para cada requisito funcional, definir teste.

Tabela:

| TEST-ID | Tipo | Requisito | Cenário | Pré-condição | Resultado esperado | Gate |
|---|---|---|---|---|---|---|

Definir:

- coverage;
- fixtures;
- factories;
- isolation;
- test database;
- mocks;
- external sandbox;
- flaky test policy;
- screenshots;
- browser matrix;
- device matrix;
- QA manual;
- homologação.

---

# 33. DOCUMENTO 18 — AMBIENTES, SEEDS E BOOTSTRAP

Definir:

```text
development
test
staging
production
```

Definir:

- env vars;
- secret names;
- config validation;
- safe defaults;
- seeds;
- admin bootstrap;
- roles;
- permissions;
- categories;
- feature flags;
- demo data;
- reset;
- forbidden production reset;
- environment parity.

Não registrar valores secretos.

Criar apenas nomes e descrições.

---

# 34. DOCUMENTO 19 — BACKUP, RESTORE E DR

Definir:

- PostgreSQL backup;
- WAL;
- full;
- incremental/differential;
- files;
- configs;
- secrets encrypted;
- retention;
- offsite;
- verification;
- restore test;
- RPO;
- RTO;
- incident;
- corruption;
- disk failure;
- VPS loss.

Declarar:

```text
BACKUP NO MESMO HOST NÃO É DISASTER RECOVERY
```

Criar runbook de restore.

---

# 35. DOCUMENTO 20 — CI/CD E RELEASE

Definir:

- branch strategy;
- conventional commits;
- semantic version;
- PR;
- lint;
- typecheck;
- unit;
- integration;
- build;
- security scanning;
- artifact;
- image;
- registry;
- staging;
- migrations;
- smoke;
- production;
- rollback;
- changelog;
- release notes.

Definir compatibilidade de migrations:

```text
expand
migrate
contract
```

---

# 36. DOCUMENTO 21 — ROADMAP PARA CODEX

Criar roadmap fechado:

```text
PHASE-000 preparação e leitura
PHASE-001 repositório e monorepo
PHASE-002 ambiente local
PHASE-003 infraestrutura base
PHASE-004 PostgreSQL e migrations
PHASE-005 autenticação
PHASE-006 RBAC
PHASE-007 API foundation
PHASE-008 frontend foundation
PHASE-009 módulos P0
PHASE-010 módulos P1
PHASE-011 arquivos
PHASE-012 filas e workers
PHASE-013 n8n
PHASE-014 IA
PHASE-015 observabilidade
PHASE-016 segurança
PHASE-017 performance
PHASE-018 staging
PHASE-019 homologação
PHASE-020 produção
PHASE-021 estabilização
```

Para cada fase:

```text
objetivo
pré-condições
tarefas
arquivos
entregáveis
testes
gate
rollback
bloqueios
definição de pronto
```

Codex não pode pular fase sem gate aprovado.

---

# 37. DOCUMENTO 22 — MATRIZ DE RASTREABILIDADE

Mapear:

```text
REQ → FR → SCREEN → API → DB → RBAC → EVENT/JOB → TEST → PHASE
```

Tabela:

| Requisito | Função | Tela | API | Tabela | Permissão | Evento/Job | Teste | Fase | Status |
|---|---|---|---|---|---|---|---|---|---|

Nenhum FR pode ficar sem implementação planejada e teste.

Nenhuma API pode existir sem FR.

Nenhuma tabela pode existir sem finalidade.

---

# 38. DOCUMENTO 23 — ADRs

Criar ADRs, no mínimo:

```text
ADR-001 arquitetura
ADR-002 frontend
ADR-003 backend
ADR-004 monorepo
ADR-005 banco
ADR-006 data access
ADR-007 auth
ADR-008 sessões
ADR-009 RBAC
ADR-010 Redis
ADR-011 filas
ADR-012 storage
ADR-013 proxy
ADR-014 deploy
ADR-015 observabilidade
ADR-016 backup
ADR-017 n8n
ADR-018 IA
ADR-019 multi-tenancy ou organização
ADR-020 alta disponibilidade
```

Cada ADR:

```text
contexto
opções
critérios
decisão
consequências
riscos
gatilho de revisão
fontes
```

---

# 39. DOCUMENTO 24 — RISCOS E LACUNAS

Registrar:

| RISK-ID | Categoria | Risco | Probabilidade | Impacto | Detecção | Mitigação | Contingência | Gate |
|---|---|---|---|---|---|---|---|---|

Incluir:

```text
scope creep
função inventada
regra ambígua
RBAC incorreto
perda de dados
migration failure
downtime
VPS overload
disk full
backup inválido
secret exposure
queue stopped
AI unavailable
n8n unavailable
dependency vulnerability
single point of failure
insufficient tests
documentation drift
```

Consolidar:

- UNKNOWN;
- ASSUMPTION;
- DECISION_BLOCKED;
- PROPOSED_PRODUCT_REQUIREMENT.

---

# 40. DOCUMENTO 25 — RUNBOOKS

Criar runbooks planejados para:

```text
deploy
rollback
migration
restore
DB unavailable
Redis unavailable
queue blocked
worker failed
disk full
high CPU
high memory
slow query
TLS renewal
secret rotation
user lockout
security incident
n8n unavailable
Ollama unavailable
VPS restart
VPS loss
```

Cada runbook:

```text
sintoma
impacto
pré-requisitos
diagnóstico
ação
validação
rollback
escalonamento
evidência
```

---

# 41. DOCUMENTO 26 — HANDOFF PARA CODEX

Criar um contrato de execução para o Codex.

Deve conter:

```text
papel
autoridade
fontes canônicas
ordem de leitura
regras
proibições
workflow
gates
checkpoints
relatórios
controle de mudanças
definição de pronto
```

Regras obrigatórias:

- Codex deve ler todos os documentos;
- Codex não pode inventar requisito;
- Codex não pode alterar ADR sem registrar novo ADR;
- Codex deve trabalhar por fase;
- Codex deve usar skills aplicáveis;
- Codex deve usar subagentes especializados;
- Codex deve executar testes;
- Codex deve manter rastreabilidade;
- Codex deve parar em `DECISION_BLOCKED`;
- Codex deve documentar desvios;
- Codex não deve acessar ou copiar o legado;
- Codex deve criar novo projeto separado;
- Codex deve manter segurança e backup desde a fundação.

Incluir um prompt inicial completo para o Codex.

Não executar o prompt.

---

# 42. DOCUMENTO 27 — CHECKLIST DE ACEITE

Criar checklist por:

```text
produto
frontend
backend
banco
API
auth
RBAC
security
files
queues
n8n
IA
infra
observability
performance
tests
backup
deploy
documentation
handoff
```

Cada item deve ser verificável.

Não usar “está bom” ou critérios subjetivos.

---

# 43. DOCUMENTO 28 — RELATÓRIO DE CONSISTÊNCIA

Após escrever todos os documentos, realizar auditoria final.

Verificar:

```text
links quebrados
IDs duplicados
IDs ausentes
requisitos sem teste
funções sem tela/API
APIs sem função
tabelas sem uso
permissões sem recurso
jobs sem fila
filas sem consumidor
ADRs contraditórios
stack divergente
paths divergentes
nomes divergentes
decisões abertas
TODO
TBD
placeholder
secret
documento vazio
diagrama inválido
roadmap sem gate
risco sem mitigação
```

Registrar cada checagem.

O relatório deve declarar somente fatos verificados.

---

# 44. ORGANIZAÇÃO DE SUBAGENTES

Use subagentes quando disponíveis.

Divisão recomendada:

```text
AGENT-PRODUCT
AGENT-UX
AGENT-FRONTEND
AGENT-BACKEND
AGENT-DATABASE
AGENT-SECURITY
AGENT-INTEGRATIONS
AGENT-DEVOPS
AGENT-SRE
AGENT-QA
AGENT-DOCUMENTATION
AGENT-CONSISTENCY-REVIEWER
```

Cada subagente deve:

- ler este prompt;
- atuar somente em documentação;
- usar classificação de informação;
- citar fontes oficiais;
- não criar código;
- não decidir fora de sua área;
- devolver conteúdo ao agente principal.

O agente principal deve:

- reconciliar conflitos;
- fechar decisões;
- manter nomenclatura;
- revisar links;
- validar rastreabilidade;
- executar auditoria final.

Não permita que subagentes criem arquivos conflitantes simultaneamente.

---

# 45. CONTROLE DE QUALIDADE

Faça três passes obrigatórios:

## PASS-1 — Planejamento e decisões

- pesquisar;
- comparar;
- decidir;
- registrar ADRs;
- estruturar requisitos.

## PASS-2 — Escrita documental

- criar todos os documentos;
- preencher integralmente;
- criar links;
- criar diagramas;
- criar matrizes.

## PASS-3 — Verificação independente

- revisar consistência;
- revisar segurança;
- revisar rastreabilidade;
- revisar ausência de implementação;
- revisar ausência de alucinação;
- revisar referências;
- revisar decisões bloqueadas.

Nenhum documento deve ser aprovado antes do PASS-3.

---

# 46. REGRAS DE CONTEÚDO

Não usar frases genéricas como:

```text
implementar segurança
criar testes
usar boas práticas
otimizar banco
garantir performance
```

Detalhar exatamente:

```text
qual controle
onde
como
quando
quem executa
qual evidência
qual critério de aceite
qual teste
qual gate
```

Não escrever código de produção.

Pode incluir:

- pseudocódigo;
- contratos;
- exemplos de payload;
- SQL conceitual;
- diagramas;
- estrutura de pastas;
- schemas OpenAPI resumidos.

---

# 47. PROIBIÇÕES

Não:

```text
criar src/
criar apps/
criar packages/
criar package.json
criar docker-compose.yml
criar Dockerfile
criar migrations reais
criar .env real
instalar framework
executar npm
executar pnpm
executar docker
executar banco
alterar VPS
fazer deploy
criar repositório remoto
fazer commit
fazer push
copiar projeto legado
auditar projeto legado
pedir autorização
perguntar se deve continuar
```

Apenas Markdown em `docs/planejamento/`.

---

# 48. GATES DOCUMENTAIS

Definir e validar:

```text
GATE-DOC-001 requisitos classificados
GATE-DOC-002 escopo fechado
GATE-DOC-003 stack decidida
GATE-DOC-004 arquitetura consistente
GATE-DOC-005 frontend especificado
GATE-DOC-006 backend especificado
GATE-DOC-007 banco especificado
GATE-DOC-008 API rastreada
GATE-DOC-009 auth e RBAC completos
GATE-DOC-010 segurança revisada
GATE-DOC-011 filas e jobs completos
GATE-DOC-012 storage completo
GATE-DOC-013 infraestrutura completa
GATE-DOC-014 observabilidade completa
GATE-DOC-015 performance testável
GATE-DOC-016 QA completo
GATE-DOC-017 backup e restore completos
GATE-DOC-018 roadmap executável
GATE-DOC-019 rastreabilidade completa
GATE-DOC-020 handoff Codex completo
GATE-DOC-021 consistência aprovada
```

---

# 49. CONDIÇÃO PARA CODEX

No índice mestre, definir:

```text
CODEX_READY = YES | NO
```

`CODEX_READY = YES` somente quando:

- todos os documentos existirem;
- nenhum documento estiver vazio;
- stack estiver fechada;
- decisões críticas estiverem resolvidas;
- requisitos estiverem classificados;
- rastreabilidade estiver completa;
- roadmap estiver completo;
- handoff estiver completo;
- PASS-3 estiver aprovado.

Se houver decisão crítica bloqueada:

```text
CODEX_READY = NO
```

Não falsifique readiness.

---

# 50. VALIDAÇÃO DO SISTEMA DE ARQUIVOS

Ao final:

1. listar `docs/planejamento/`;
2. confirmar exatamente 29 arquivos;
3. confirmar todos maiores que zero;
4. calcular linhas e SHA-256;
5. validar links relativos;
6. procurar arquivos extras;
7. procurar arquivos temporários;
8. confirmar que nenhum arquivo fora de `docs/planejamento/` foi criado ou alterado por esta execução.

Não reverta arquivos preexistentes.

---

# 51. RESPOSTA FINAL

Não apresente conteúdo extenso no chat.

Responda somente com:

```text
PROJECT_ROOT =
DOCUMENTATION_ROOT =

FILES_EXPECTED = 29
FILES_CREATED =
FILES_MISSING =
FILES_EMPTY =
TOTAL_LINES =
TOTAL_SIZE =
MASTER_INDEX =
CODEX_HANDOFF =
CONSISTENCY_REPORT =

USER_CONFIRMED_COUNT =
PROPOSED_REQUIREMENTS_COUNT =
ASSUMPTIONS_COUNT =
UNKNOWN_COUNT =
DECISIONS_BLOCKED_COUNT =
ADRS_COUNT =
FUNCTIONAL_REQUIREMENTS_COUNT =
BUSINESS_RULES_COUNT =
API_ENDPOINTS_COUNT =
DATABASE_ENTITIES_COUNT =
PERMISSIONS_COUNT =
TEST_CASES_COUNT =
RISKS_COUNT =
IMPLEMENTATION_PHASES_COUNT =
GATES_COUNT =

BROKEN_LINKS =
DUPLICATE_IDS =
UNTRACED_REQUIREMENTS =
UNTESTED_REQUIREMENTS =
CONTRADICTORY_DECISIONS =
TODO_COUNT =
TBD_COUNT =
PLACEHOLDER_COUNT =
SECRET_VALUES_FOUND =

PASS_1 = APPROVED | BLOCKED
PASS_2 = APPROVED | BLOCKED
PASS_3 = APPROVED | BLOCKED

DOCUMENTATION_COMPLETE = YES | NO
PRODUCT_REQUIREMENTS_READY = YES | NO
ARCHITECTURE_READY = YES | NO
SECURITY_READY = YES | NO
DATABASE_READY = YES | NO
API_READY = YES | NO
INFRASTRUCTURE_READY = YES | NO
TEST_STRATEGY_READY = YES | NO
CODEX_HANDOFF_READY = YES | NO
CODEX_READY = YES | NO

IMPLEMENTATION_STARTED = NO
CODE_CREATED = NO
DEPENDENCIES_INSTALLED = NO
DATABASE_CREATED = NO
VPS_CHANGED = NO
LEGACY_PROJECT_ACCESSED = NO
ONLY_DOCUMENTATION_CREATED = YES
```

Não pergunte o que fazer depois.

Não implemente nada após concluir.

A execução termina com o pacote documental completo e validado.
