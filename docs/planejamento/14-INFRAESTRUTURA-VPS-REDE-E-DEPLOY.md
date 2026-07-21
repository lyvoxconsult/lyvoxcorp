# 14 — Infraestrutura VPS, Rede e Deploy

- **Documento ID:** DOC-14
- **Versão:** 1.0.0
- **Status:** APPROVED_BY_ARCHITECTURE_AGENT
- **Data:** 2026-07-21
- **Responsável:** Ottercraft (DevOps & Infrastructure Architect)
- **Classificação:** ARCHITECTURAL_DECISION / USER_CONFIRMED
- **Documentos Dependentes:** [05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md](file:///c:/Users/pedro/OneDrive/Documentos/00-Projetos/19-%20lyvoxcorp/docs/planejamento/05-ARQUITETURA-GERAL-E-DECISOES-DE-STACK.md)
- **Fontes Consultadas:** PROMPT-MESTRE-OTTERCRAFT, Docker Compose v2 Docs, Caddy Documentation

---

## 1. Topologia de Infraestrutura VPS Self-Hosted

A plataforma **Lyvox Gerenciamento** opera em infraestrutura **Ubuntu Linux LTS** dedicada, utilizando **Docker Compose v2** para orquestração isolada de contêineres e **Caddy** como servidor web de borda e terminação TLS.

```mermaid
graph TD
    Client[Navegadores & APIs Externas] -->|HTTPS 443 / HTTP 80| Firewall[UFW Firewall Host]
    
    subgraph Host_VPS[VPS Ubuntu Server]
        Firewall -->|Port 443| Caddy[Caddy Reverse Proxy & TLS]

        subgraph Docker_Bridge[Rede Interna Docker: lyvox-bridge]
            Caddy -->|HTTP 3000| WebApp[Frontend Container]
            Caddy -->|HTTP 4000| BackendApp[Fastify Backend Container]
            BackendApp -->|TCP 5432| PgPool[PgBouncer Container]
            PgPool -->|TCP 5432| PostgresDB[(PostgreSQL 16 Storage)]
            BackendApp -->|TCP 6379| RedisStore[(Redis 7 Cache)]
            Worker[BullMQ Worker Container] -->|TCP 6379| RedisStore
            Worker -->|TCP 5432| PgPool

            BackendApp -->|HTTP 5678| ExistingN8n[n8n Local Container]
            Worker -->|HTTP 11434| ExistingOllama[Ollama Local Container]
        end
    end
```

---

## 2. Hardening de Rede e Firewall (UFW)

### 2.1 Regras de Porta Exposta no Host
Apenas as portas estritamente necessárias para tráfego web e administração via chave SSH permanecem abertas no firewall do SO:

| Porta Host | Protocolo | Serviço | Exposição Externa | Justificativa |
|---|---|---|---|---|
| `22` | TCP | SSH (Chave Pública Apenas) | Restrita (IP Admin) | Administração remota do servidor |
| `80` | TCP | HTTP Caddy | Pública | Redirecionamento automático HTTP -> HTTPS |
| `443` | TCP | HTTPS Caddy | Pública | Tráfego seguro web criptografado TLS 1.3 |
| `5432` | TCP | PostgreSQL | **BLOQUEADA** | Acesso restrito à rede interna Docker |
| `6379` | TCP | Redis | **BLOQUEADA** | Acesso restrito à rede interna Docker |
| `4000` | TCP | Fastify Backend | **BLOQUEADA** | Acesso apenas via proxy Caddy |

---

## 3. Orquestração Docker Compose (`docker-compose.yml`)

### 3.1 Políticas Globais de Contêineres
- **Restart Policy:** `restart: unless-stopped` para todos os contêineres essenciais.
- **Resource Limits:** Definição obrigatória de limites de memória e CPU para evitar consumo descontrolado por um único contêiner.
- **Healthchecks:** Configuração de comandos `healthcheck` ativos para verificação de liveness.

```yaml
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - lyvox-bridge

  backend:
    image: lyvox/backend:latest
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://lyvox_app:${DB_PASSWORD}@pgbouncer:5432/lyvox_db
      REDIS_URL: redis://redis:6379
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8192M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
    networks:
      - lyvox-bridge
```

---

## 4. Estratégia de Deploy Sem Indisponibilidade (Zero-Downtime Swap)

O procedimento de publicação de novas versões no ambiente de produção segue o padrão **Blue-Green Container Swap**:

1. Compilação da nova imagem Docker do backend com a tag `:latest` e `:v<BUILD_NUMBER>`.
2. Execução das migrations do PostgreSQL em modo seguro (*Expand Phase*) via contêiner temporário de migration (`docker run --rm lyvox/backend:latest pnpm db:migrate`).
3. Subida da nova instância do contêiner em porta interna secundária (`backend-green`).
4. Verificação de resposta positiva no healthcheck (`/health` retorna `HTTP 200`).
5. Atualização da rota do Caddy via reload a quente (`caddy reload`), direcionando 100% do tráfego para a nova instância sem derrubar conexões ativas.
6. Encerramento gracioso (*Graceful Shutdown* - 15s) do contêiner antigo (`backend-blue`).
