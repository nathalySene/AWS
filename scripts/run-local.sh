#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"
mkdir -p .local/dynamodb
docker compose up -d dynamodb
database_ready=false
for attempt in {1..50}; do
    if curl -sS -o /dev/null http://127.0.0.1:8000 2>/dev/null; then database_ready=true; break; fi
    sleep 0.2
done
if [[ "$database_ready" != true ]]; then
    echo "DynamoDB Local não respondeu na porta 8000. Consulte docker compose logs dynamodb." >&2
    exit 1
fi
export ASPNETCORE_ENVIRONMENT=Development
export DynamoDb__ServiceUrl=http://127.0.0.1:8000
export DynamoDb__TableName=suportehub-local
export Storage__KeysPath="$repo_root/.local/keys"
export Storage__UploadsPath="$repo_root/.local/uploads"
export ASPNETCORE_URLS="${ASPNETCORE_URLS:-http://127.0.0.1:5218}"
cd backend/SuporteHub.API
exec dotnet bin/Debug/net10.0/SuporteHub.API.dll
