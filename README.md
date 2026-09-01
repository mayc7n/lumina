# Lumina

> Produtividade, hábitos e evolução pessoal em um só lugar.

Lumina é um app mobile-first para organizar tarefas, hábitos, metas, estudos e momentos de foco com uma experiência simples e consistente.

## Plataformas

- **Apple** — instalável no iPhone e iPad pelo Safari
- **Android** — instalável pelo Chrome
- **Web** — responsivo para desktop e tablet

A versão atual é um web app instalável. A distribuição pela App Store e Google Play pode ser adicionada posteriormente sem alterar o produto principal.

## Recursos

- tarefas, projetos e calendário
- hábitos, metas e conquistas
- sessões de foco e estudos
- diário e biblioteca de leitura
- analytics e evolução pessoal
- recursos sociais

## Melhorias recentes

- autenticação server-side com cookies protegidos
- senhas com BCrypt e tokens persistidos com hash
- Row-Level Security e acessos mínimos no PostgreSQL
- validação de entradas, consultas parametrizadas e uploads restritos
- rate limiting, mitigação de abuso automatizado, HTTPS e headers de segurança
- dependências e código analisados por Semgrep, OWASP e OSV
- respostas da API limitadas e dados sensíveis protegidos
- emojis substituídos por ícones profissionais
- instalação mobile preparada para Apple e Android

## Tecnologia

Next.js 15, TypeScript, Java 21, Spring Boot 3.5, PostgreSQL 16, Redis e RabbitMQ.

## Executar localmente

```bash
cp .env.example .env
docker compose up -d postgres redis rabbitmq

cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
cd ../frontend && npm install && npm run dev
```

Frontend: `http://localhost:3000`

API: `http://localhost:8080/api`

Os controles implementados e suas evidências estão em [docs/SECURITY-HARDENING.md](docs/SECURITY-HARDENING.md).

## Licença

MIT
