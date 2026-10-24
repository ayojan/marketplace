#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="${1:-/opt/ayoj-backend}"

if [ ! -d "$DEPLOY_DIR" ]; then
  echo "❌ Error: Deployment directory $DEPLOY_DIR does not exist!"
  exit 1
fi

cd "$DEPLOY_DIR"

if [ ! -f ".env" ]; then
  echo "❌ Error: $DEPLOY_DIR/.env file is missing! Please configure it from .env.example before deploying."
  exit 1
fi

echo "============================================================"
echo "🚀 Starting Ayoj Backend Deployment on $(date -u)"
echo "Directory: $DEPLOY_DIR"
echo "============================================================"

# 1. Pull the newest Docker image from GHCR
echo "📦 Pulling latest web container image..."
docker compose -f docker-compose.prod.yml pull web

# 2. Deploy/update the web container
echo "🔄 Rolling update web container..."
docker compose -f docker-compose.prod.yml up -d --no-deps web

# 3. Ensure Caddy reverse proxy is running
echo "🌐 Ensuring Caddy reverse proxy is running..."
docker compose -f docker-compose.prod.yml up -d caddy

# 4. Wait for web container to become healthy
echo "⏳ Waiting for health check verification (http://localhost:3000/up)..."
MAX_ATTEMPTS=24 # 24 * 5s = 120 seconds max
ATTEMPT=0
HEALTH_STATUS="unknown"

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  STATUS=$(docker inspect --format='{{json .State.Health.Status}}' ayoj-backend-web 2>/dev/null || echo '"unknown"')
  
  if [ "$STATUS" = '"healthy"' ]; then
    HEALTH_STATUS="healthy"
    break
  elif [ "$STATUS" = '"unhealthy"' ]; then
    echo "⚠️ Web container reported unhealthy on attempt $ATTEMPT/$MAX_ATTEMPTS..."
  else
    echo "⏳ Container starting (attempt $ATTEMPT/$MAX_ATTEMPTS - status: $STATUS)..."
  fi
  sleep 5
done

if [ "$HEALTH_STATUS" != "healthy" ]; then
  echo "❌ Deployment Failed: Container did not become healthy within 120 seconds!"
  echo "📋 Showing recent web logs:"
  docker compose -f docker-compose.prod.yml logs --tail=60 web
  exit 1
fi

echo "✅ Web container is healthy and responding to requests!"

# 5. Clean up dangling images to keep disk usage low on 30GB disk
echo "🧹 Pruning dangling Docker images..."
docker image prune -f

echo "============================================================"
echo "🎉 Deployment successfully completed on $(date -u)!"
echo "============================================================"
