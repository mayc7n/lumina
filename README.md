# Lumina

> Organize sua rotina. Evolua com clareza.

Lumina é uma plataforma de produtividade pessoal que reúne tarefas, hábitos, metas, estudos e momentos de foco em uma experiência simples e consistente.

## O produto

- tarefas, projetos e calendário
- hábitos, metas e acompanhamento de progresso
- sessões de foco e estudos
- diário e biblioteca de leitura
- indicadores de evolução pessoal
- conquistas e recursos sociais

## Próximo passo

O Lumina está em desenvolvimento. A versão web atual é a base funcional usada para construir e validar o produto, mas não representa sua forma final.

O objetivo é lançar o Lumina como aplicativo móvel para **iOS** e **Android**, com distribuição pela **App Store** e pelo **Google Play**. O foco futuro do projeto está na experiência mobile, não na permanência como aplicativo web.

## Segurança

O projeto utiliza autenticação server-side, cookies protegidos, senhas com BCrypt, isolamento de dados no PostgreSQL, validação de entradas, rate limiting e análise contínua de código e dependências.

Os controles implementados e suas evidências estão em [docs/SECURITY-HARDENING.md](docs/SECURITY-HARDENING.md).

## Tecnologia

Next.js 15, TypeScript, Java 21, Spring Boot 3.5, PostgreSQL 16, Redis e RabbitMQ.

## Desenvolvimento local

```bash
cp .env.example .env
docker compose up -d postgres redis rabbitmq

cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
cd ../frontend && npm install && npm run dev
```

- Frontend: `http://localhost:3000`
- API: `http://localhost:8080/api`

## Licença

MIT
