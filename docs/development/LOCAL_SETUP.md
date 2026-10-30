# Local Development Setup

This guide will help you set up and run the Ayoj Marketplace on your local machine.

---

## Architecture & Ports Quick Reference

| Service | Local Dev (`docker-compose.local.yml`) | Unified Prod-Mirror (`docker-compose.yml`) |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` (Next.js hot reload) | Proxied via Nginx at `http://localhost` |
| **Backend API** | `http://localhost:3001` (Rails code reload) | Proxied via Nginx at `http://localhost/api` |
| **ActiveAdmin** | `http://localhost:3001/admin` | Proxied at `http://localhost/admin` |
| **PostgreSQL** | `localhost:5432` | Internal to Docker network |
| **Redis** | `localhost:6379` | Internal to Docker network |
| **Nginx** | Not started | `http://localhost` or `http://localhost:8080` |

---

## Option 1: Fast Docker Development (Recommended)

Run the entire application stack containerized with code-volume mounting so any edit on your host machine automatically hot-reloads inside the container.

### Mac (Colima) Compatibility
Memory limits are pre-configured to **~2.9 GB total** across all containers, ensuring smooth performance on an 8 GB RAM Mac running Colima (which defaults to a 4.1 GB VM).

```bash
# 1. Start all containers in detached mode
docker-compose -f docker-compose.local.yml up -d

# 2. View live logs
docker-compose -f docker-compose.local.yml logs -f backend
docker-compose -f docker-compose.local.yml logs -f frontend
```

* Open your browser to **`http://localhost:3000`** to browse the marketplace.
* Open **`http://localhost:3001/services/search`** to test the API.

---

## Option 2: Host-based Development (Hybrid)

If you prefer running Rails or Next.js directly on macOS for debugging with `byebug` or IDE debuggers:

### 1. Start Database & Redis in Docker
```bash
docker-compose -f docker-compose.local.yml up -d db redis
```

### 2. Start Rails Backend (Host)
Ensure you have Ruby 3.2.4+ and `libpq` installed:
```bash
cd backend
bundle install
rails db:prepare
rails s -p 3001
```

### 3. Start Next.js Frontend (Host)
Ensure you have Node.js 20+ installed:
```bash
cd frontend
npm install
npm run dev
```

---

## Option 3: Unified Production-Mirror Stack

To test the exact unified architecture that runs on your cloud VM (including Nginx routing, Gzip, and static asset caching):

```bash
# Build and boot all production images
docker-compose up -d --build
```

* Access the unified app at **`http://localhost`** (or **`http://localhost:8080`**).
* All requests are routed through Nginx just like in production!

---

## Common Troubleshooting

* **Frontend displays `Cannot find module '@tailwindcss/postcss'`**: Ensure Node.js version is $\ge 20$. In Docker, this is handled automatically via `node:20-alpine`.
* **Port 5432 already allocated**: If an SSH tunnel or local Postgres process is already listening on `5432`, stop the conflicting process or remap `5433:5432` in `docker-compose.local.yml`.
* **Database Reset / Re-seed**:
  ```bash
  docker exec -it marketplace-backend-1 bin/rails db:seed
  ```
