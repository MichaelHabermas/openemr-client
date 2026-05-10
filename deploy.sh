#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="openemr-client"
IMAGE_NAME="openemr-client"
HOST_PORT="3001"
CONTAINER_PORT="3000"
ENV_FILE="${ENV_FILE:-$HOME/repos/openemr-client/.env.production}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR"

echo "==> Pulling latest changes..."
git pull --ff-only

echo "==> Building image..."
docker build -t "$IMAGE_NAME" .

echo "==> Stopping old container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  -p "$HOST_PORT:$CONTAINER_PORT" \
  "$IMAGE_NAME"

echo "==> Waiting for health check..."
for i in $(seq 1 10); do
  if curl -sf "http://localhost:$HOST_PORT/login" -o /dev/null 2>/dev/null; then
    echo "==> Deploy complete. Container running on port $HOST_PORT."
    exit 0
  fi
  sleep 1
done

echo "==> Warning: container started but health check failed after 10s."
echo "    Check logs: docker logs $CONTAINER_NAME"
exit 1
