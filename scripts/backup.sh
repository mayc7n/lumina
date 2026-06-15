#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
COMPOSE_FILE="$ROOT_DIR/compose.production.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo ausente: $ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
output="$BACKUP_DIR/lumina-$timestamp.sql.gz"

cd "$ROOT_DIR"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump --clean --if-exists --no-owner --no-privileges \
  -U "${DB_USERNAME:-lumina}" "${DB_NAME:-lumina}" | gzip -9 > "$output"

find "$BACKUP_DIR" -type f -name 'lumina-*.sql.gz' -mtime +14 -delete
echo "Backup criado: $output"
