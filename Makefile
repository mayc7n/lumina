.PHONY: dev build test clean docker-up docker-down

## Start development environment
dev:
	docker compose up -d postgres redis rabbitmq
	@set -eu; \
	backend_pid=""; \
	cleanup() { \
		if [ -n "$$backend_pid" ]; then kill "$$backend_pid" 2>/dev/null || true; fi; \
	}; \
	trap cleanup EXIT INT TERM; \
	if curl -fsS http://127.0.0.1:8080/api/actuator/health >/dev/null 2>&1; then \
		echo "Backend já está ativo em http://localhost:8080/api"; \
	else \
		( \
			cd backend && \
			DB_HOST=127.0.0.1 DB_PORT=5433 \
			DB_NAME=lumina DB_USERNAME=lumina DB_PASSWORD=lumina \
			REDIS_HOST=127.0.0.1 REDIS_PORT=6380 REDIS_PASSWORD=lumina \
			RABBITMQ_HOST=127.0.0.1 RABBITMQ_PORT=5672 \
			RABBITMQ_USERNAME=lumina RABBITMQ_PASSWORD=lumina \
			RABBITMQ_VHOST=/lumina \
			./mvnw spring-boot:run -Dspring-boot.run.profiles=dev \
		) & \
		backend_pid=$$!; \
	fi; \
	if curl -fsS http://127.0.0.1:3000/api/health >/dev/null 2>&1; then \
		echo "Frontend já está ativo em http://localhost:3000"; \
	else \
		cd frontend && npm run dev; \
	fi

## Build all services
build:
	cd backend && ./mvnw package -DskipTests -B
	cd frontend && npm run build

## Run backend tests
test-backend:
	cd backend && ./mvnw test

## Type check frontend
test-frontend:
	cd frontend && npm run type-check && npm run lint

## Start full docker stack
docker-up:
	docker compose up -d

## Stop docker stack
docker-down:
	docker compose down

## Remove all containers and volumes
docker-clean:
	docker compose down -v --remove-orphans

## View backend logs
logs-backend:
	docker compose logs -f backend

## View all logs
logs:
	docker compose logs -f

## Database migrations
migrate:
	cd backend && ./mvnw flyway:migrate -Dspring-boot.run.profiles=dev

## Generate initial secret
gen-secret:
	openssl rand -base64 64

## Health check
health:
	curl -s http://localhost:8080/api/actuator/health | python3 -m json.tool
