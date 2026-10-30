# 🌟 Ayoj Marketplace

Ayoj is an event & celebration marketplace connecting customers with verified creative partners (photographers, decorators, caterers, DJs, makeup artists, event planners, and venues).

---

## ⚡ Quick Start (Local Development)

### Option 1: Everything in Docker (Colima / Mac Safe)
All services are pre-configured with memory guardrails (~2.9 GB max) to run smoothly inside Colima on an 8 GB Mac:

```bash
# 1. Start all services in detached mode
docker-compose -f docker-compose.local.yml up -d

# 2. Browse the marketplace
open http://localhost:3000
```

* **Frontend (Next.js)**: `http://localhost:3000`
* **Backend API (Rails)**: `http://localhost:3001`
* **ActiveAdmin**: `http://localhost:3001/admin`
* **Solid Queue Monitor**: `http://localhost:3001/solid_queue`

---

### Option 2: Host + Docker Hybrid

```bash
# 1. Start Postgres & Redis in Docker
docker-compose -f docker-compose.local.yml up -d db redis

# 2. Start Rails API (port 3001)
cd backend && bundle install && rails db:prepare && rails s -p 3001

# 3. Start Next.js (port 3000)
cd frontend && npm install && npm run dev
```

---

## 📖 Comprehensive Documentation

* 🐳 **[Docker Architecture Guide](docs/development/DOCKER.md)**: Container setup, Colima memory limits, and service topology.
* 💻 **[Local Setup & Troubleshooting](docs/development/LOCAL_SETUP.md)**: Development workflows and debugging tips.
* 🚀 **[Production Deployment Guide](docs/deployment/DEPLOYMENT.md)**: Consolidated deployment on OCI Always Free ($0/month) with Cloudflare and GitHub Actions CI/CD.
* 🔀 **[Reverse Proxy & Nginx Guide](docs/REVERSE_PROXY.md)**: Unified routing, Cloudflare Real-IP restoration, and caching.

---

## 🏗 Technology Stack

* **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS v4, Framer Motion.
* **Backend**: Ruby on Rails 8 / 7.2 REST API, Puma, Active Storage (`libvips`).
* **Database**: PostgreSQL 15 / 16 (Full-Text Search, GIN indexes, JSONB).
* **Caching**: Redis 7 Alpine (`redis_cache_store` + rate limiting).
* **Background Jobs**: Rails Solid Queue (persisted in PostgreSQL).
* **Reverse Proxy & Edge**: Nginx Alpine behind Cloudflare (WAF, SSL, Cloudflare R2).
