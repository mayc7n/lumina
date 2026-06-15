#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Uso: $0 backups/lumina-AAAAMMDDTHHMMSSZ.sql.gz"
  exit 1
fi

ROOT_DIR=$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.production}"
COMPOSE_FILE="$ROOT_DIR/compose.production.yml"
BACKUP_FILE=$1

if [ ! -f "$ENV_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "Arquivo de ambiente ou backup não encontrado."
  exit 1
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

printf "Isto substituirá os dados atuais. Digite RESTAURAR para continuar: "
read -r confirmation
[ "$confirmation" = "RESTAURAR" ] || exit 1

cd "$ROOT_DIR"
gzip -dc "$BACKUP_FILE" | docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U "${DB_USERNAME:-lumina}" "${DB_NAME:-lumina}"

echo "Restauração concluída."
