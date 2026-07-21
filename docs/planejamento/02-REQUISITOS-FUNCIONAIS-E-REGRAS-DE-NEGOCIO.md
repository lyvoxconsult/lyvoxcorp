# 02 — Requisitos Funcionais e Regras de Negócio

- **Documento ID:** DOC-02
- **Versão:** 1.0.0
- **Status:** REVIEW_REQUIRED
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (Requirements Analyst & Product Owner)
- **Classificação:** PROPOSED_PRODUCT_REQUIREMENT / ARCHITECTURAL_DECISION
- **Documentos Dependentes:** [01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/01-VISAO-PRODUTO-ESCOPO-E-PRINCIPIOS.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Requisitos da Plataforma Lyvox

---

## 1. Mapeamento Geral de Requisitos e Regras de Negócio

Este documento estabelece a especificação completa de todas as funcionalidades (FR) e regras de negócio (BR) dos 16 módulos operacionais do **Lyvox Gerenciamento**.

---

## 2. Especificação Detalhada por Módulo

### 2.1 Módulo 1: Identidade, Acesso e Segurança

#### Requisitos Funcionais (FR)
- **FR-001 (Login com Credenciais):** Permitir autenticação de usuários via e-mail e senha com hash seguro (Argon2id).
- **FR-002 (Logout e Invalidação de Sessão):** Permitir encerramento de sessão com invalidação imediata do Refresh Token no servidor/Redis.
- **FR-003 (Recuperação e Troca de Senha):** Enviar e-mail de redefinição de senha com token de uso único (validade 15 min) e exigir confirmação da senha anterior na alteração logada.
- **FR-004 (Gestão de Dispositivos e Sessões Ativas):** Listar todas as sessões ativas do usuário (IP, User-Agent, data de criação) com opção de revogação individual ou global.
- **FR-005 (Autenticação Multi-Fator - MFA):** Permitir ativação opcional ou obrigatória de TOTP (Google Authenticator/Authy) com códigos de backup.
- **FR-006 (Gestão de Usuários):** Criar, visualizar, editar, suspender/bloquear, reativar e listar usuários do sistema.
- **FR-007 (Gestão de Cargos e Permissões - RBAC):** Criar perfis/cargos customizados e atribuir permissões granulares por módulo e ação (Create, Read, Update, Delete, Export, Approve).

#### Regras de Negócio (BR)
- **BR-001 (Política de Senhas Fortes):** Mínimo de 12 caracteres, contendo maiúsculas, minúsculas, números e símbolos especiais.
- **BR-002 (Bloqueio por Tentativas Incorretas):** Bloquear a conta por 15 minutos após 5 tentativas consecutivas de login incorretas (Proteção Brute Force).
- **BR-003 (MFA Obrigatório para Administradores):** Usuários com papel `Super Admin` ou `Administrador` devem obrigatoriamente ativar MFA TOTP.
- **BR-004 (Deny by Default):** Qualquer ação não explicitamente permitida no perfil do usuário deve ser rejeitada com erro HTTP 403 Forbidden.

---

### 2.2 Módulo 2: Dashboard Executivo

#### Requisitos Funcionais (FR)
- **FR-010 (Visão Geral KPI):** Exibir cards de indicadores em tempo real: faturamento mensal, receita recorrente (MRR), total de clientes ativos, leads no pipeline, tarefas pendentes e saldo financeiro.
- **FR-011 (Painel de Pendências e Atalhos):** Apresentar lista de aprovações pendentes, propostas a vencer, tarefas em atraso e atalhos rápidos para criação de registros.
- **FR-012 (Filtragem por Permissão e Contexto):** Renderizar métricas e gráficos estritamente limitados ao escopo de permissão do usuário logado (ex: vendedor visualiza apenas suas metas e leads).

#### Regras de Negócio (BR)
- **BR-010 (Atualização do Dashboard):** Os dados de KPI devem ser cacheados em Redis por 60 segundos para evitar sobrecarga no PostgreSQL em acessos concorrentes.

---

### 2.3 Módulo 3: Gestão de Clientes

#### Requisitos Funcionais (FR)
- **FR-020 (Cadastro Completo de Clientes):** Cadastrar clientes (Pessoa Física/Jurídica) com dados cadastrais, CNPJ/CPF, razão social, nome fantasia, inscrição estadual, endereço, contatos e tags.
- **FR-021 (Histórico Unificado 360°):** Exibir linha do tempo contendo todas as interações do cliente (reuniões, propostas, contratos, projetos, tarefas, chamados e lançamentos financeiros).
- **FR-022 (Vínculo de Responsáveis):** Atribuir um ou mais responsáveis internos (account manager/suporte) a cada cliente.
- **FR-023 (Busca Global e Filtros Avançados):** Permitir busca por nome, CNPJ, e-mail, segmento, status (Ativo/Inativo/Churned) e tags.

#### Regras de Negócio (BR)
- **BR-020 (Unicidade de CPF/CNPJ):** Não permitir o cadastro duplicado de CPF ou CNPJ ativo na mesma organização.
- **BR-021 (Soft Delete de Clientes):** Clientes vinculados a contratos ou lançamentos financeiros não podem ser excluídos fisicamente; apenas arquivados/desativados (`deleted_at`).

---

### 2.4 Módulo 4: CRM e Gestão de Leads

#### Requisitos Funcionais (FR)
- **FR-030 (Pipeline de Vendas Kanban):** Exibir quadro visual com colunas personalizáveis (ex: Novo, Qualificado, Reunião Agendada, Proposta Enviada, Negociação, Ganho, Perdido).
- **FR-031 (Captura e Importação de Leads):** Receber leads via webhook externo (n8n/formulários) e importação via planilha CSV.
- **FR-032 (Gestão de Follow-ups e Cadências):** Registrar tarefas de contato (e-mail, ligação, mensagem) com alertas de lembrete.
- **FR-033 (Conversão de Lead em Cliente):** Converter lead qualificado (Status Ganho) em Cliente ativo no sistema com 1 clique, preservando todo o histórico do CRM.

#### Regras de Negócio (BR)
- **BR-030 (Motivo de Perda Obrigatório):** Ao mover um lead para a etapa `Perdido`, o sistema exige a seleção de um motivo padronizado e justificativa em texto.

---

### 2.5 Módulo 5: Gestão de Reuniões

#### Requisitos Funcionais (FR)
- **FR-040 (Agendamento e Pauta):** Cadastrar reuniões vinculadas a clientes/leads, com data, horário, pauta, link de videoconferência e participantes internos/externos.
- **FR-041 (Registro de Notas e Anexos):** Salvar ata da reunião, arquivos anexos e decisões tomadas.
- **FR-042 (Transcrição e Análise por IA):** Upload de áudio/vídeo ou texto da reunião para geração automática de resumo, pontos de ação e tarefas via Ollama/n8n.
- **FR-043 (Geração Automática de Tarefas):** Converter itens de ação extraídos da ata em tarefas reais no módulo de projetos com responsável e prazo.

#### Regras de Negócio (BR)
- **BR-040 (Aviso Prévio de Agendamento):** O sistema deve emitir notificação interna e e-mail para todos os participantes 15 minutos antes do horário agendado.

---

### 2.6 Módulo 6: Serviços e Tabela de Valores

#### Requisitos Funcionais (FR)
- **FR-050 (Catálogo de Serviços):** Cadastrar serviços oferecidos com nome, descrição, categoria, unidade de medida (hora, projeto, mensalidade) e valor base.
- **FR-051 (Versionamento de Preços):** Manter histórico de preços alterados sem impactar propostas e contratos antigos já celebrados.
- **FR-052 (Tipos de Cobrança):** Suportar cobrança pontual (projeto/escopo fechado) e cobrança recorrente (assinatura/retainer).

#### Regras de Negócio (BR)
- **BR-050 (Imutabilidade de Tabela em Contratos Ativos):** Reajustes de preço no catálogo afetam apenas novas propostas; propostas vigentes mantêm o valor contratado.

---

### 2.7 Módulo 7: Propostas e Contratos

#### Requisitos Funcionais (FR)
- **FR-060 (Gerador de Propostas Comerciais):** Criar propostas comerciais vinculando clientes, itens de serviços, condições de pagamento, validade e descontos.
- **FR-061 (Geração de PDF Personalizado):** Exportar proposta em PDF formatado com branding da empresa.
- **FR-062 (Fluxo de Aprovação Eletrônica):** Enviar link seguro para o cliente visualizar e aceitar eletronicamente a proposta.
- **FR-063 (Conversão Automática em Contrato e Financeiro):** Proposta aprovada gera automaticamente o Contrato de Prestação de Serviços e os lançamentos no Contas a Receber.

#### Regras de Negócio (BR)
- **BR-060 (Expiração Automática de Propostas):** Propostas com data de validade ultrapassada mudam status automaticamente para `Expirada` via worker assíncrono.

---

### 2.8 Módulo 8: Projetos e Gestão de Tarefas

#### Requisitos Funcionais (FR)
- **FR-070 (Criação e Gestão de Projetos):** Cadastrar projetos com nome, cliente, responsável, data de início, prazo previsto, orçamento e status.
- **FR-071 (Visões de Tarefas - Lista, Kanban e Calendário):** Alternar a visualização de tarefas entre quadro Kanban (Por Fazer, Em Andamento, Em Revisão, Concluído), Lista detalhada e Calendário.
- **FR-072 (Gestão Completa de Tarefas):** Criar tarefas com subtarefas, responsável, prioridade (Baixa, Média, Alta, Urgente), datas, estimativa de horas, anexos e comentários.
- **FR-073 (Apontamento de Horas - Timesheet):** Registrar horas trabalhadas por tarefa com descrição do trabalho executado.

#### Regras de Negócio (BR)
- **BR-070 (Bloqueio de Conclusão por Subtarefas):** Uma tarefa pai só pode ser marcada como `Concluída` se 100% de suas subtarefas obrigatórias estiverem finalizadas.

---

### 2.9 Módulo 9: Financeiro (Contas a Pagar, Receber e Fluxo de Caixa)

#### Requisitos Funcionais (FR)
- **FR-080 (Gestão de Contas a Receber):** Lançar receitas com vencimento, valor, cliente, proposta vinculada, categoria, centro de custo e status (Pendente, Pago, Atrasado, Cancelado).
- **FR-081 (Gestão de Contas a Pagar):** Registrar despesas fixas e variáveis com comprovantes anexos, fornecedor, vencimento e autorização de pagamento.
- **FR-082 (Gestão de Recorrências Financeiras):** Agendar faturamentos e despesas recorrentes (mensal, trimestral, anual) com geração automática de parcelas.
- **FR-083 (Relatórios de Fluxo de Caixa e DRE Simplicado):** Gerar relatórios financeiros de caixa (entradas e saídas reais) e competência (DRE).

#### Regras de Negócio (BR)
- **BR-080 (Integridade Transacional Financeira):** A baixa de um lançamento financeiro atualiza o saldo e exige obrigatoriamente a data real do pagamento e a conta bancária/caixa de destino. Lançamentos baixados são imutáveis (exigem estorno formal para alteração).

---

### 2.10 Módulo 10: Marketing e Calendário Editorial

#### Requisitos Funcionais (FR)
- **FR-090 (Calendário Editorial Multicanal):** Planejar conteúdos (posts, artigos, e-mails) organizados por canal (Instagram, LinkedIn, Blog, YouTube), data de publicação e status.
- **FR-091 (Geração Assistida de Copy por IA):** Utilizar a IA local (Ollama) para gerar ideias de pauta, títulos e rascunhos de legenda.
- **FR-092 (Repositório de Mídia e Kit de Marca):** Armazenar assets visuais, logotipos, paletas de cor e fontes da empresa.

#### Regras de Negócio (BR)
- **BR-090 (Aprovação de Conteúdo):** Nenhum post pode ter o status alterado para `Pronto para Publicar` sem a aprovação explícita do responsável de marketing.

---

### 2.11 Módulo 11: Automações e Engine de Workflows

#### Requisitos Funcionais (FR)
- **FR-100 (Motor de Gatilhos e Ações Internas):** Configurar regras de automação no formato *Trigger -> Condition -> Action* (ex: Quando contrato for assinado -> Criar projeto -> Notificar gerente).
- **FR-101 (Integração Nativa com n8n):** Enviar webhooks assinados para o n8n local e receber callbacks de retorno para execução de fluxos externos complexos.
- **FR-102 (Log e Histórico de Execuções):** Exibir painel com histórico de execuções de automações, status (Sucesso/Falha), tempo de resposta e payload de entrada/saída.

#### Regras de Negócio (BR)
- **BR-100 (Limite de Retries e Circuit Breaker):** Automações com falha repetida serão reexecutadas até 3 vezes com *exponential backoff*. Após a terceira falha, a automação entra em estado `FALHA_DLQ` e alerta o administrador.

---

### 2.12 Módulo 12: Central de Notificações

#### Requisitos Funcionais (FR)
- **FR-110 (Notificações In-App e Push):** Exibir central de notificações com indicador de não lidas, agrupadas por severidade (Info, Sucesso, Alerta, Erro).
- **FR-111 (Disparo de E-mails Transacionais):** Enviar e-mails de sistema (boas-vindas, redefinição de senha, lembretes de tarefas, propostas).
- **FR-112 (Preferências de Notificação por Usuário):** Permitir que cada usuário escolha quais eventos deseja receber via e-mail ou apenas in-app.

#### Regras de Negócio (BR)
- **BR-110 (Garantia de Entrega Assíncrona):** O envio de notificações não pode bloquear as requisições HTTP da aplicação; todo envio deve ser processado via fila assíncrona (BullMQ).

---

### 2.13 Módulo 13: Gestão de Arquivos e Documentos

#### Requisitos Funcionais (FR)
- **FR-120 (Upload e Armazenamento Seguro):** Realizar upload de arquivos (PDF, PNG, JPG, DOCX, XLSX, ZIP) com validação de tipo MIME e extensão.
- **FR-121 (Vínculo Contextual de Arquivos):** Anexar arquivos a entidades do sistema (Clientes, Tarefas, Propostas, Reuniões, Lançamentos Financeiros).
- **FR-122 (Download Autorizado e URL Protegida):** Gerar links temporários de download autenticados, proibindo acesso direto não autorizado.

#### Regras de Negócio (BR)
- **BR-120 (Limite de Tamanho e Antivírus):** Limite máximo de 50MB por arquivo no upload. Arquivos executáveis (.exe, .bat, .sh, .php, .js) são terminantemente proibidos.

---

### 2.14 Módulo 14: Configurações da Empresa e Sistema

#### Requisitos Funcionais (FR)
- **FR-130 (Dados da Empresa e Branding):** Configurar razão social, CNPJ, endereço, logotipo, favicon e cores institucionais para propostas e relatórios.
- **FR-131 (Parâmetros Globais do Sistema):** Definir fuso horário padrão (America/Sao_Paulo), moeda (BRL), prazos padrões de propostas e limites de upload.

#### Regras de Negócio (BR)
- **BR-130 (Restrição de Alteração de Parâmetros):** Apenas o perfil `Super Admin` tem permissão para alterar as configurações globais da empresa e integrações.

---

### 2.15 Módulo 15: Assistente e Inteligência Artificial

#### Requisitos Funcionais (FR)
- **FR-140 (Interface de Chat e Copiloto):** Prover painel lateral de assistente virtual para geração de textos, resumos de reuniões e consultas de dados autorizados.
- **FR-141 (Abstração de Provedores de IA):** Conectar à IA local via Ollama (modelo Llama 3 / Mistral) com suporte configurável para fallback em APIs externas (OpenAI/Anthropic).
- **FR-142 (Modo Operação Degradada):** Permitir o funcionamento normal de 100% dos módulos do sistema caso o serviço de IA esteja fora do ar.

#### Regras de Negócio (BR)
- **BR-140 (Privacidade e Não Vazamento de Dados):** Nenhum dado sensível ou financeiro do cliente pode ser enviado para APIs externas de IA sem consentimento explícito configurado.

---

### 2.16 Módulo 16: Trilha de Auditoria e Logs

#### Requisitos Funcionais (FR)
- **FR-150 (Registro de Eventos Sensíveis):** Registrar automaticamente todas as ações de criação, alteração, exclusão, login, alteração de permissão e exportação de dados.
- **FR-151 (Consulta de Trilha de Auditoria):** Permitir a administradores filtrar logs de auditoria por data, usuário, IP, módulo, entidade e tipo de ação.

#### Regras de Negócio (BR)
- **BR-150 (Imutabilidade dos Logs de Auditoria):** Os registros da tabela de auditoria (`audit_logs`) não podem ser alterados ou excluídos sob nenhuma hipótese (Insert-only table).

---

## 3. Matriz de Requisitos Funcionais vs. Módulos

| ID FR | Módulo | Função | Regra de Negócio Vinculada | Ator Principal |
|---|---|---|---|---|
| FR-001 | Identidade & Acesso | Login via Credenciais | BR-001, BR-002 | Todos os Usuários |
| FR-005 | Identidade & Acesso | Autenticação MFA | BR-003 | Administradores |
| FR-007 | Identidade & Acesso | Gestão de Cargos/RBAC | BR-004 | Super Admin |
| FR-020 | Clientes | Cadastro de Clientes | BR-020, BR-021 | Gerente de Projetos |
| FR-033 | CRM & Leads | Conversão de Lead | BR-030 | Vendedor / SDR |
| FR-063 | Propostas/Contratos | Conversão Proposta em Contrato | BR-060 | Vendedor / Diretor |
| FR-072 | Projetos/Tarefas | Gestão de Tarefas | BR-070 | Analista / Operacional |
| FR-080 | Financeiro | Contas a Receber | BR-080 | Financeiro |
| FR-101 | Automações | Integração n8n | BR-100 | Sistema / Admin |
| FR-120 | Arquivos | Upload de Arquivos | BR-120 | Todos os Usuários |
| FR-141 | Assistente IA | Provedor Ollama | BR-140 | Todos os Usuários |
| FR-150 | Auditoria | Registro de Trilha de Auditoria | BR-150 | Sistema / Audit |
