# 02 — Requisitos Funcionais e Regras de Negócio

- **Documento ID:** DOC-02
- **Versão:** 2.0.0
- **Status:** APPROVED_FOR_CODEX_IMPLEMENTATION
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Requirements Analyst & Product Owner)
- **Classificação:** USER_APPROVED_FOR_PLANNING / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md](./01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md)
- **Fontes Consultadas:** PROMPT-FINAL-UNICO-OTTERCRAFT, Requisitos da Plataforma Lyvox

---

## 1. Mapeamento Geral de Requisitos e Regras de Negócio

Este documento estabelece a especificação completa de todas as funcionalidades (FR) e regras de negócio (BR) dos 16 módulos operacionais do **Lyvox Gerenciamento**.

---

## 2. Especificação Detalhada por Módulo

### 2.1 Módulo 1: Identidade, Acesso e Segurança

#### Requisitos Funcionais (FR)
- **FR-001 (Login com Credenciais):** Autenticar usuários via e-mail e senha com hash seguro Argon2id, criando sessão opaca server-side persistida no PostgreSQL com cache em Redis e cookie `HttpOnly, Secure, SameSite=Lax`.
- **FR-002 (Logout e Invalidação de Sessão):** Encerrar sessão ativa ou revogar todas as sessões do usuário com remoção no Redis e marcação no PostgreSQL.
- **FR-003 (Recuperação e Troca de Senha):** Enviar e-mail de redefinição de senha com token seguro de uso único (validade 15 min) e exigir confirmação da senha anterior para alterações logadas.
- **FR-004 (Gestão de Dispositivos e Sessões Ativas):** Listar sessões ativas do usuário (IP, User-Agent, data de criação) com opção de revogação individual ou global.
- **FR-005 (Autenticação Multi-Fator - MFA):** Exigir MFA TOTP obrigatório para o papel `Administrador` e opcional para demais perfis, suportando códigos de backup criptografados.
- **FR-006 (Gestão de Usuários):** Criar (apenas por admin via convite), visualizar, editar, suspender/bloquear, reativar e listar usuários.
- **FR-007 (Gestão de Cargos e Permissões - RBAC):** Criar perfis/cargos customizados além dos 5 papéis semente (`Administrador`, `Gestão`, `Financeiro`, `Comercial`, `Operacional`), atribuindo permissões no formato `recurso.ação`.

#### Regras de Negócio (BR)
- **BR-001 (Política de Senhas Fortes):** Mínimo de 12 caracteres, contendo maiúsculas, minúsculas, números e símbolos especiais.
- **BR-002 (Bloqueio por Tentativas Incorretas):** Bloquear a conta temporariamente por 15 minutos após 5 tentativas consecutivas de login incorretas.
- **BR-003 (MFA Obrigatório para Administradores):** Usuários com papel `Administrador` devem obrigatoriamente ativar MFA TOTP no primeiro acesso.
- **BR-004 (Deny by Default):** Qualquer ação não explicitamente permitida no perfil do usuário é rejeitada com erro HTTP 403 Forbidden.

---

### 2.2 Módulo 2: Dashboard Executivo

#### Requisitos Funcionais (FR)
- **FR-010 (Visão Geral KPI):** Exibir cards de indicadores em tempo real: faturamento mensal, receita recorrente (MRR), total de clientes ativos, leads no pipeline, tarefas pendentes e saldo financeiro gerencial.
- **FR-011 (Painel de Pendências e Atalhos):** Apresentar lista de aprovações pendentes, propostas a vencer, tarefas em atraso e atalhos rápidos de criação.
- **FR-012 (Filtragem por Permissão e Contexto):** Renderizar métricas estritamente limitadas ao escopo de permissão do usuário logado.

#### Regras de Negócio (BR)
- **BR-010 (Atualização de KPIs em Cache):** Dados de KPI são cacheados em Redis por 60 segundos para evitar sobrecarga no PostgreSQL.

---

### 2.3 Módulo 3: Gestão de Clientes

#### Requisitos Funcionais (FR)
- **FR-020 (Cadastro Completo de Clientes):** Cadastrar clientes (Pessoa Física/Jurídica) com dados cadastrais, CNPJ/CPF (com validação de dígitos verificadores), razão social, nome fantasia, endereço, contatos e tags.
- **FR-021 (Histórico Unificado 360°):** Exibir linha do tempo com todas as interações do cliente (reuniões, propostas, contratos, projetos, tarefas e lançamentos financeiros).
- **FR-022 (Vínculo de Responsáveis):** Atribuir um ou mais responsáveis internos ao cliente.
- **FR-023 (Busca Global e Filtros Avançados):** Permitir busca por nome, CNPJ, e-mail, status (Ativo/Inativo/Churned) e tags.

#### Regras de Negócio (BR)
- **BR-020 (Unicidade de CPF/CNPJ):** Não permitir o cadastro duplicado de CPF ou CNPJ ativo no sistema.
- **BR-021 (Soft Delete de Clientes):** Clientes vinculados a contratos ou lançamentos financeiros não podem ser excluídos fisicamente; apenas arquivados/desativados (`deleted_at`).

---

### 2.4 Módulo 4: CRM e Gestão de Leads

#### Requisitos Funcionais (FR)
- **FR-030 (Pipeline de Vendas Kanban):** Exibir quadro visual com colunas personalizáveis (ex: Novo, Qualificado, Reunião Agendada, Proposta Enviada, Ganho, Perdido).
- **FR-031 (Captura e Importação de Leads):** Receber leads via webhook autenticado (n8n/formulários) e importação via CSV.
- **FR-032 (Gestão de Follow-ups e Cadências):** Registrar tarefas de contato (e-mail, ligação, mensagem) com alertas.
- **FR-033 (Conversão de Lead em Cliente):** Converter lead qualificado (Status Ganho) em Cliente ativo com 1 clique, preservando o histórico.

#### Regras de Negócio (BR)
- **BR-030 (Motivo de Perda Obrigatório):** Ao mover um lead para a etapa `Perdido`, o sistema exige a seleção de um motivo padronizado e justificativa em texto.

---

### 2.5 Módulo 5: Gestão de Reuniões

#### Requisitos Funcionais (FR)
- **FR-040 (Agendamento e Pauta):** Cadastrar reuniões vinculadas a clientes/leads, com data, horário, pauta, link e participantes internos/externos.
- **FR-041 (Registro de Notas e Anexos):** Salvar ata da reunião, arquivos anexos e decisões tomadas.
- **FR-042 (Transcrição e Análise por IA):** Upload de transcrição enviada pelo usuário para geração de resumo, pontos de ação e tarefas via Ollama local.
- **FR-043 (Geração Automática de Tarefas):** Converter itens de ação extraídos da ata em tarefas reais no módulo de projetos.

#### Regras de Negócio (BR)
- **BR-040 (Aviso Prévio de Agendamento):** O sistema emite notificação interna 15 minutos antes do horário agendado.

---

### 2.6 Módulo 6: Serviços e Tabela de Valores

#### Requisitos Funcionais (FR)
- **FR-050 (Catálogo de Serviços):** Cadastrar serviços com nome, descrição, categoria, unidade de medida e valor base.
- **FR-051 (Versionamento de Preços):** Manter histórico de preços alterados sem impactar propostas e contratos antigos.
- **FR-052 (Tipos de Cobrança):** Suportar cobrança pontual e cobrança recorrente.

#### Regras de Negócio (BR)
- **BR-050 (Imutabilidade de Tabela em Contratos Ativos):** Reajustes no catálogo afetam apenas novas propostas; propostas vigentes mantêm o valor contratado.

---

### 2.7 Módulo 7: Propostas e Contratos

#### Requisitos Funcionais (FR)
- **FR-060 (Gerador de Propostas Comerciais):** Criar propostas comerciais vinculando clientes, itens de serviços, condições de pagamento, validade e descontos.
- **FR-061 (Geração de PDF Personalizado):** Exportar proposta em PDF formatado com branding da empresa.
- **FR-062 (Fluxo de Aprovação Interna):** Aprovação interna de propostas por gestores. *(Nota: Assinatura digital qualificada externa é `OUT_OF_SCOPE_INITIAL`)*.
- **FR-063 (Conversão Automática em Contrato e Financeiro):** Proposta aprovada gera automaticamente o Contrato e os lançamentos em Contas a Receber.

#### Regras de Negócio (BR)
- **BR-060 (Expiração Automática de Propostas):** Propostas com data de validade ultrapassada mudam status automaticamente para `Expirada` via worker.

---

### 2.8 Módulo 8: Projetos e Gestão de Tarefas

#### Requisitos Funcionais (FR)
- **FR-070 (Criação e Gestão de Projetos):** Cadastrar projetos com nome, cliente, responsável, data de início, prazo previsto, orçamento de referência e status.
- **FR-071 (Visões de Tarefas):** Alternar a visualização de tarefas entre Lista, Kanban, Calendário e Gantt.
- **FR-072 (Gestão Completa de Tarefas):** Criar tarefas com subtarefas (usando `parent_task_id`), responsável, prioridade, datas, anexos e comentários.
- **FR-073 (Apontamento de Horas / Timesheet):** *(Nota: Apontamento detalhado de horas é `OUT_OF_SCOPE_INITIAL`)*.

#### Regras de Negócio (BR)
- **BR-070 (Bloqueio de Conclusão por Subtarefas):** Uma tarefa pai só pode ser marcada como `Concluída` se 100% de suas subtarefas obrigatórias estiverem finalizadas.

---

### 2.9 Módulo 9: Financeiro

#### Requisitos Funcionais (FR)
- **FR-080 (Gestão de Contas a Receber):** Lançar receitas com vencimento, valor, cliente, proposta vinculada, categoria, centro de custo e status.
- **FR-081 (Gestão de Contas a Pagar):** Registrar despesas fixas e variáveis com comprovantes anexos, fornecedor, vencimento e autorização.
- **FR-082 (Gestão de Recorrências Financeiras):** Agendar faturamentos e despesas recorrentes com geração automática de parcelas.
- **FR-083 (Relatórios de Fluxo de Caixa e DRE Gerencial):** Gerar relatórios financeiros gerenciais de caixa e competência (identificados claramente como gerenciais, não contábeis oficiais).

#### Regras de Negócio (BR)
- **BR-080 (Integridade Transacional Financeira):** A baixa de um lançamento atualiza o saldo e exige a data real do pagamento e conta/caixa interno. Lançamentos baixados são imutáveis (exigem estorno formal).

---

### 2.10 Módulo 10: Marketing

#### Requisitos Funcionais (FR)
- **FR-090 (Calendário Editorial Multicanal):** Planejar conteúdos organizados por canal, data e status.
- **FR-091 (Geração Assistida de Copy por IA):** Utilizar a IA local (Ollama) para gerar ideias de pauta, títulos e rascunhos de legenda.
- **FR-092 (Repositório de Mídia e Kit de Marca):** Armazenar assets visuais, logotipos e paletas de cor da empresa.

#### Regras de Negócio (BR)
- **BR-090 (Aprovação de Conteúdo):** Nenhum post muda para `Pronto para Publicar` sem aprovação do responsável de marketing.

---

### 2.11 Módulo 11: Automações

#### Requisitos Funcionais (FR)
- **FR-100 (Motor de Gatilhos e Ações Internas):** Configurar regras de automação no formato *Trigger -> Condition -> Action*.
- **FR-101 (Integração Nativa com n8n):** Enviar webhooks assinados com HMAC para o n8n local via Transactional Outbox e receber callbacks.
- **FR-102 (Log e Histórico de Execuções):** Exibir painel com histórico de execuções, status, tempo de resposta e payloads.

#### Regras de Negócio (BR)
- **BR-100 (Limite de Retries e Circuit Breaker):** Automações com falha repetida são reexecutadas até 3 vezes com *exponential backoff* antes de irem para a DLQ.

---

### 2.12 Módulo 12: Central de Notificações

#### Requisitos Funcionais (FR)
- **FR-110 (Notificações In-App):** Exibir central de notificações internas com indicador de não lidas e links contextuais.
- **FR-111 (Disparo de E-mails Transacionais):** Enviar e-mails de sistema (convites, redefinição de senha, lembretes, propostas) via abstração SMTP (Mailpit em dev, SMTP configurável em prod).
- **FR-112 (Preferências de Notificação):** Permitir que cada usuário escolha quais eventos deseja receber via e-mail ou in-app.

#### Regras de Negócio (BR)
- **BR-110 (Processamento Assíncrono de Notificações):** Todo envio de notificação/e-mail é processado via fila assíncrona BullMQ.

---

### 2.13 Módulo 13: Gestão de Arquivos e Storage Privado

#### Requisitos Funcionais (FR)
- **FR-120 (Upload e Armazenamento Seguro):** Upload de arquivos com validação de tamanho (<50MB), extensão e Magic Bytes MIME Type.
- **FR-121 (Vínculo Contextual de Arquivos):** Anexar arquivos a Clientes, Tarefas, Propostas, Reuniões e Lançamentos Financeiros.
- **FR-122 (Download Autorizado via API):** Servir arquivos através de stream autenticada pela API Fastify, proibindo acesso estático direto.

#### Regras de Negócio (BR)
- **BR-120 (Restrição de Extensões e Antivírus):** Arquivos executáveis são terminantemente proibidos. Nomes no disco utilizam UUIDv4 neutro.

---

### 2.14 Módulo 14: Configurações da Empresa e Sistema

#### Requisitos Funcionais (FR)
- **FR-130 (Dados da Empresa e Branding):** Configurar razão social, CNPJ, endereço, logotipo e cores institucionais.
- **FR-131 (Parâmetros Globais do Sistema):** Definir fuso horário (`America/Sao_Paulo`), moeda (`BRL`) e limites de upload.

#### Regras de Negócio (BR)
- **BR-130 (Restrição de Alteração de Parâmetros):** Apenas o papel `Administrador` pode alterar configurações globais da empresa.

---

### 2.15 Módulo 15: Assistente e Inteligência Artificial

#### Requisitos Funcionais (FR)
- **FR-140 (Interface de Chat e Copiloto):** Painel lateral de assistente virtual para geração de textos e resumos de transcrições de reuniões.
- **FR-141 (Provedor Ollama Local):** Conectar à IA local via Ollama (`llama3` / `mistral`). Não possui fallback automático pago para API externa.
- **FR-142 (Modo Operação Degradada):** O sistema permanece 100% funcional caso o serviço de IA esteja fora do ar.

#### Regras de Negócio (BR)
- **BR-140 (Privacidade de Dados de IA):** Dados sensíveis ou financeiros nunca são enviados para APIs externas.

---

### 2.16 Módulo 16: Trilha de Auditoria e Logs Imutáveis

#### Requisitos Funcionais (FR)
- **FR-150 (Registro de Eventos Sensíveis):** Registrar ações de login, logout, alteração de permissões, operações financeiras e exportações.
- **FR-151 (Consulta de Trilha de Auditoria):** Permitir a administradores filtrar logs de auditoria por data, usuário, IP, módulo e tipo de ação.

#### Regras de Negócio (BR)
- **BR-150 (Imutabilidade dos Logs de Auditoria):** A tabela `audit_logs` é estritamente *Insert-only* (sem UPDATE ou DELETE).
