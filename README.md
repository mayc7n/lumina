# ✦ Lumina — Personal Excellence Platform

> SaaS premium de produtividade humana, hábitos e evolução pessoal.

## 🏗 Arquitetura

```
lumina/
├── backend/          Java 21 + Spring Boot 3.3
│   ├── api/          Controllers, DTOs, Middleware
│   ├── application/  Services, Events
│   ├── domain/       Entities, Repositories (JPA)
│   └── infrastructure/ Security, Cache, Messaging
│
├── frontend/         Next.js 14 + TypeScript + TailwindCSS
│   ├── app/          App Router pages
│   ├── components/   UI + Feature components
│   ├── hooks/        React Query hooks
│   ├── lib/          API client + utils
│   └── store/        Zustand stores
│
└── infrastructure/
    ├── nginx/        Reverse proxy
    ├── monitoring/   Prometheus + Grafana
    └── scripts/      DB init scripts
```

## 🚀 Stack

| Layer       | Technology                            |
|-------------|---------------------------------------|
| Backend     | Java 21 LTS, Spring Boot 3.3          |
| Frontend    | Next.js 14, React 18, TypeScript      |
| Database    | PostgreSQL 16                         |
| Cache       | Redis 7.2                             |
| Messaging   | RabbitMQ 3.13                         |
| Realtime    | WebSockets (STOMP)                    |
| Proxy       | NGINX 1.25                            |
| Monitoring  | Prometheus + Grafana + Sentry         |
| CI/CD       | GitHub Actions                        |
| Cloud       | AWS-ready (ECS / EC2 / RDS / ElastiCache) |

## 🔒 Segurança

- JWT access token (15min) + refresh token rotativo (30d)
- 2FA via TOTP (Google Authenticator)
- OAuth2 (Google, GitHub)
- OWASP Top 10
- Rate limiting com Bucket4j + Redis
- CSP, HSTS, Secure Headers
- RBAC completo
- Audit logs
- Sessões por dispositivo com detecção de reuso

## 🎯 Funcionalidades

- ✅ **Tarefas** — Projetos, subtarefas, prioridades, recorrência
- 🔥 **Hábitos** — Streaks, frequência, lembretes, calendário
- 🎯 **Metas** — Marcos, check-ins, progresso visual
- 🧠 **Foco** — Pomodoro, Deep Work, Flow, Quick Burst
- 📔 **Diário** — Editor rico, humor, energia, tags
- 📚 **Livros** — Biblioteca, log de leitura, progresso
- 📖 **Estudos** — Matérias, sessões, tempo acumulado
- 📊 **Analytics** — Score, gráficos, insights com IA
- 👥 **Social** — Feed de amigos, conquistas
- 🗓 **Calendário** — Visão mensal de tarefas
- 🏆 **Conquistas** — Sistema saudável de achievements

## 🛠 Dev Local

```bash
# 1. Clone e configure
cp .env.example .env
# Edite .env com suas variáveis

# 2. Suba infraestrutura
docker compose up -d postgres redis rabbitmq

# 3. Backend
cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# 4. Frontend
cd frontend && npm install && npm run dev
```

**URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:8080/api
- Swagger: http://localhost:8080/api/swagger-ui.html
- RabbitMQ: http://localhost:15672

## 🚢 Deploy

O deploy de produção usa Docker Compose, PostgreSQL persistente e Caddy com HTTPS automático.

### Requisitos

- VPS Ubuntu com 4 GB de RAM ou mais
- domínio ou subdomínio apontado para o IP público do VPS
- portas TCP `22`, `80` e `443` liberadas; UDP `443` é recomendado para HTTP/3
- Docker Engine e plugin Docker Compose instalados

### Primeiro deploy

No DNS, crie um registro `A` como `app.seudominio.com` apontando para o IP do VPS.
Depois, no servidor:

```bash
sudo mkdir -p /opt/lumina
sudo chown "$USER":"$USER" /opt/lumina
git clone https://github.com/mayc7n/lumina /opt/lumina
cd /opt/lumina

cp deploy.env.example .env.production
nano .env.production
```

Gere os segredos:

```bash
openssl rand -base64 48
openssl rand -base64 48
openssl rand -base64 48
openssl rand -base64 64
```

Preencha `DOMAIN`, `ACME_EMAIL`, as três senhas e `JWT_SECRET`, então:

```bash
chmod +x scripts/*.sh
BUILD_LOCAL=1 ./scripts/deploy.sh
```

O site ficará disponível em `https://SEU_DOMINIO`. PostgreSQL, Redis e RabbitMQ não
publicam portas na internet.

Depois que o GitHub Actions publicar as imagens no GHCR, as atualizações normais usam:

```bash
./scripts/deploy.sh
```

### Operação

```bash
# Estado e logs
docker compose --env-file .env.production -f compose.production.yml ps
docker compose --env-file .env.production -f compose.production.yml logs -f backend

# Atualizar
git pull --ff-only
./scripts/deploy.sh

# Backup do PostgreSQL
./scripts/backup.sh

# Restaurar um backup
./scripts/restore.sh backups/lumina-AAAAMMDDTHHMMSSZ.sql.gz
```

Para deploy automático pelo GitHub Actions, configure:

- Secrets: `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_APP_URL`
- Variable: `PROD_DOMAIN`
- diretório `/opt/lumina` já clonado e `.env.production` preenchido no VPS

## 📄 Licença

MIT
