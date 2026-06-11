.PHONY: dev build test clean docker-up docker-down

## Start development environment
dev:
	docker compose up -d postgres redis rabbitmq
	cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &
	cd frontend && npm run dev

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
