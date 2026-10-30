# Docker Setup for Marketplace Application

This document provides instructions for running the Marketplace application using Docker for both local development and production environments.

---

## Architecture Overview

The application is structured into containerized microservices:

* **Frontend**: Next.js 14 App Router (Node.js 20, TypeScript, Tailwind CSS)
* **Backend**: Ruby on Rails 8 / 7.2 REST API with Active Storage
* **Database**: PostgreSQL 15 / 16 (with persistent volume)
* **Cache**: Redis 7 Alpine (Rails `redis_cache_store` + rate limiting)
* **Background Jobs**: Rails Solid Queue (transactional queues persisted in PostgreSQL)
* **Reverse Proxy**: Nginx Alpine (routing, Gzip compression, and Cloudflare Real-IP restoration)

---

## 1. Local Development (`docker-compose.local.yml`)

Use this configuration when developing locally with live code reload.

### Memory & Performance (Tuned for 8 GB Mac & Colima)
Container limits are pre-configured to consume **~2.9 GB max** so it runs smoothly inside Colima's 4.1 GB virtual machine:
* `db`: `512m`
* `redis`: `128m`
* `backend`: `1200m`
* `frontend`: `1000m`

### Start Development Services
```bash
# Start all local development containers in detached mode:
docker-compose -f docker-compose.local.yml up -d
```

### Access Endpoints
| Service | URL | Notes |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | Next.js dev server with hot reload |
| **Backend API** | `http://localhost:3001` | Rails API server with code reload |
| **ActiveAdmin** | `http://localhost:3001/admin` | Admin portal |
| **Solid Queue Monitor** | `http://localhost:3001/solid_queue` | Background job dashboard |
| **PostgreSQL** | `localhost:5432` | User: `marketplace`, Password: `password` |
| **Redis** | `localhost:6379` | Cache & session store |

---

## 2. Production-Mirror Stack (`docker-compose.yml`)

Use this configuration to test the full production architecture locally or run it on your cloud server (e.g. OCI Always Free instance).

### Start Production Stack
```bash
docker-compose up -d --build
```

### Access Endpoints (Unified Domain via Nginx)
| Service | URL | Routing Logic |
| :--- | :--- | :--- |
| **Main Marketplace** | `http://localhost` (or `:8080`) | Nginx proxies to Next.js SSR (`frontend:3000`) |
| **Backend API** | `http://localhost/api/...` | Nginx rewrites `/api/*` to `/*` and proxies to Rails |
| **Health Check** | `http://localhost/up` | Rails system health probe |
| **Active Storage** | `http://localhost/rails/active_storage/` | Direct file serving / variant transforms |

---

## 3. Useful Docker Commands

### Database Operations
```bash
# Access PostgreSQL terminal
docker exec -it marketplace-db-1 psql -U marketplace -d marketplace_production

# Run database migrations manually
docker exec -it marketplace-backend-1 bin/rails db:migrate

# Reset and re-seed the database
docker exec -it marketplace-backend-1 bin/rails db:seed
```

### Logs & Monitoring
```bash
# View live logs for backend
docker-compose logs -f backend

# View live logs for frontend
docker-compose logs -f frontend

# Check real-time CPU & memory consumption
docker stats
```

### Stopping Services
```bash
# Stop containers (preserves database data in volume)
docker-compose down

# Stop and remove volumes (WARNING: wipes local database)
docker-compose down -v
```
