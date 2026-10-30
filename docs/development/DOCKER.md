# 🐳 Docker Architecture & Operations Guide

This document details the Docker orchestration for the Ayoj Marketplace across both **Local Development** and **Cloud Production (Oracle Cloud Infrastructure Always Free VM)**.

---

## 🏗 Architecture Overview

The system consists of 5 coordinated services managed via Docker Compose:

| Container Name | Service | Image / Base | Internal Port | Host / Exposed Port | Memory Limit |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ayoj-production-nginx` | **Nginx** | `nginx:alpine` | `80`, `443` | `80:80`, `443:443` | 256 MB |
| `ayoj-production-frontend` | **Frontend** | Node.js 20 Alpine (Standalone Next.js 14) | `3000` | None (Internal Only) | 2,500 MB |
| `ayoj-production-backend` | **Backend** | Ruby 3.3 Alpine (Rails 8 Puma + Solid Queue) | `3000` | None (Internal Only) | 3,500 MB |
| `ayoj-production-db` | **PostgreSQL** | `postgres:15-alpine` | `5432` | `127.0.0.1:5432:5432` (Loopback Only) | 2,048 MB |
| `ayoj-production-redis` | **Redis** | `redis:7-alpine` | `6379` | None (Internal Only) | 512 MB |

> **Total Peak Memory Budget**: ~8.8 GB allocated out of 12 GB VM RAM, leaving ~3.2 GB for the Ubuntu kernel, OS buffers, and page cache.

---

## 1. Local Development (`docker-compose.local.yml`)

Used for day-to-day feature development with live code reloading and volume mounts.

### Resource Limits (Tuned for 8 GB Mac & Colima)
Container limits are capped at **~2.7 GB max** to run smoothly inside Colima or Docker Desktop without memory pressure:
* `db`: `512m`
* `redis`: `128m`
* `backend`: `1024m`
* `frontend`: `1024m`

### Starting Local Services
```bash
# Start all development containers in detached mode:
docker compose -f docker-compose.local.yml up -d

# Check container health & status:
docker compose -f docker-compose.local.yml ps
```

### Local Endpoints
| Service | URL | Notes |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | Next.js dev server with Fast Refresh |
| **Backend API** | `http://localhost:3001` | Rails 8 API with code reloader |
| **ActiveAdmin** | `http://localhost:3001/admin` | Operational administration portal |
| **Solid Queue Monitor** | `http://localhost:3001/solid_queue` | Background job queue dashboard |
| **PostgreSQL** | `localhost:5432` | User: `marketplace`, Password: `password` |
| **Redis** | `localhost:6379` | In-memory cache & rate limiter |

---

## 2. Production Stack (`docker-compose.yml`)

Used on the live **OCI Ampere A1 VM** (`VM.Standard.A1.Flex`, 2 OCPU, 12 GB RAM, 100 GB NVMe) behind Cloudflare.

### Key Production Enhancements
1. **Cloudflare Real-IP Restoration**: Nginx automatically restores real visitor IP addresses from `CF-Connecting-IP` across all Cloudflare IP CIDRs so Rails audit logging and rate limiting work accurately.
2. **Aggressive Edge Caching**: Next.js static chunks under `/_next/static/` are cached for 1 year (`max-age=31536000, immutable`).
3. **Loopback DB Security**: PostgreSQL is bound exclusively to `127.0.0.1:5432:5432` on the VM host. It is completely inaccessible from the public internet, but accessible to developers via secure SSH tunnels.
4. **Resilient Healthchecks**: Next.js and Rails use IPv4 explicit loopback probes (`http://127.0.0.1:3000`) to prevent Alpine Linux BusyBox IPv6 loopback connection refusal.

### Production Deployment Commands (OCI VM)
```bash
# 1. Pull latest multi-arch images from GitHub Container Registry (GHCR)
docker compose pull

# 2. Start all services in the background
docker compose up -d --remove-orphans

# 3. Run pending database migrations
docker compose exec -T backend bin/rails db:migrate

# 4. Verify all 5 containers are running and Healthy
docker compose ps
```

---

## 3. Essential Operations & Troubleshooting

### Viewing Service Logs
```bash
# Follow logs for Rails backend
docker compose logs -f backend

# Follow logs for Next.js frontend
docker compose logs -f frontend

# Follow logs for Nginx reverse proxy
docker compose logs -f nginx

# View PostgreSQL logs
docker compose logs -f db
```

### Database Operations
```bash
# Open interactive PostgreSQL console
docker compose exec -it db psql -U marketplace -d marketplace_production

# Run database seed
docker compose exec -it backend bin/rails db:seed

# Open Rails console in production
docker compose exec -it backend bin/rails console
```

### Secure Remote Database Access (SSH Tunnel)
Because port `5432` is bound only to `127.0.0.1` on the VM, connect securely from your local machine (VS Code, TablePlus, DBeaver) through an SSH tunnel:

```bash
# Forward remote port 5432 to local port 5433:
ssh -i ~/.ssh/id_rsa -N -L 5433:127.0.0.1:5432 opc@137.23.51.162
```
Now connect your local database GUI to `localhost:5433` (User: `marketplace`, Database: `marketplace_production`).

### Real-Time Resource Monitoring
```bash
# Monitor CPU, Memory, and Network I/O per container
docker stats --no-stream
```

### Stopping or Resetting Services
```bash
# Stop containers gracefully (preserves database and cache volumes)
docker compose down

# Stop containers and remove volumes (WARNING: wipes all persistent data)
docker compose down -v
```
