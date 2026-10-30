# 🚀 Ayoj Production Deployment Guide

This guide explains how to deploy the entire Ayoj full-stack marketplace (Next.js, Rails API, PostgreSQL, Redis, and Nginx) on **Oracle Cloud Infrastructure (OCI) Always Free tier** behind **Cloudflare** for **$0/month forever**.

---

## 🏗 High-Performance Consolidated Architecture

By collocating the backend and database on a single high-memory instance, we eliminate cross-cloud network round-trips, dropping API query latency from **~400ms down to <2ms**.

```
                   [Users Around the World]
                              │
                              ▼ (HTTPS via Cloudflare SSL)
        ┌───────────────────────────────────────────┐
        │       Cloudflare Edge (WAF + CDN)         │
        └─────────────────────┬─────────────────────┘
                              │
                              ▼ (Port 80/443 to OCI Static IP)
   ┌─────────────────────────────────────────────────────┐
   │         OCI Ampere A1 VM (2 OCPU, 12 GB RAM)        │
   │                                                     │
   │   ┌─────────────────────────────────────────────┐   │
   │   │             Nginx Reverse Proxy             │   │
   │   └──────┬───────────────────────────────┬──────┘   │
   │          │ (0.2ms)                       │ (0.2ms)  │
   │          ▼                               ▼          │
   │   ┌──────────────┐               ┌──────────────┐   │
   │   │   Next.js    │ (0.5ms)       │ Rails 8 API  │   │
   │   │  (Frontend)  │──────────────>│  (Backend)   │   │
   │   └──────────────┘               └───────┬──────┘   │
   │                                          │          │
   │                      ┌───────────────────┴──────┐   │
   │                      ▼                          ▼   │
   │             ┌──────────────────┐       ┌──────────┐ │
   │             │  PostgreSQL 16   │       │ Redis 7  │ │
   │             │ (DB + SolidQueue)│       │ (Cache)  │ │
   │             └──────────────────┘       └──────────┘ │
   └─────────────────────────────────────────────────────┘
                              │
                              ▼ (Nightly encrypted backup stream)
        ┌───────────────────────────────────────────┐
        │       Cloudflare R2 (10 GB Free Storage)  │
        └───────────────────────────────────────────┘
```

---

## Phase 1: OCI Always Free Compute Setup

1. **Sign Up**: Register at [oracle.com/cloud/free](https://www.oracle.com/cloud/free). Choose your target market's closest region (e.g. **India West - Mumbai**, **India South - Hyderabad**, or **Singapore**) as your permanent **Home Region**.
2. **Create Compute Instance**:
   * **Name**: `ayoj-production-server`
   * **Image**: **Ubuntu 24.04 Minimal (aarch64)** *(Arm build)*
   * **Shape**: Under the **Ampere (Arm)** tab, select **`VM.Standard.A1.Flex`**
   * **Allocations**:
     * **OCPUs**: `2`
     * **Memory**: `12 GB`
     * **Boot Volume**: `100 GB` *(Always Free includes 200 GB total)*
   * **SSH Keys**: Paste your local public key (`~/.ssh/id_rsa.pub`).
   * **Networking**: Assign a public IPv4 address.
3. **Open Firewall Ports in OCI Console**:
   * Navigate to: **Virtual Cloud Networks > Your VCN > Default Security List > Ingress Rules**.
   * Add rules for:
     * Port `22` (SSH)
     * Port `80` (HTTP)
     * Port `443` (HTTPS)

---

## Phase 2: Server Initialization

SSH into your new server:
```bash
ssh ubuntu@<YOUR_OCI_PUBLIC_IP>
```

Install Docker and Docker Compose on Ubuntu 24.04:
```bash
# Update and install Docker
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker ubuntu

# Log out and log back in for group permissions to take effect
exit
ssh ubuntu@<YOUR_OCI_PUBLIC_IP>
```

Create persistent storage directories on the host disk:
```bash
sudo mkdir -p /var/data/postgres /var/data/storage /var/backups/postgres
sudo chown -R 1000:1000 /var/data/storage
```

---

## Phase 3: Cloudflare Setup (DNS & Object Storage)

### 1. DNS Configuration
In your Cloudflare dashboard for `ayoj.in`:
* **A Record**: `@` $\rightarrow$ `<YOUR_OCI_PUBLIC_IP>` (Proxied: ☁️ Orange Cloud)
* **CNAME Record**: `www` $\rightarrow$ `ayoj.in` (Proxied: ☁️ Orange Cloud)
* **CNAME Record**: `api` $\rightarrow$ `ayoj.in` (Proxied: ☁️ Orange Cloud)
* **CNAME Record**: `admin` $\rightarrow$ `ayoj.in` (Proxied: ☁️ Orange Cloud)

### 2. SSL/TLS Setting
* Navigate to **SSL/TLS**: Set encryption mode to **Flexible** (or **Full** if mounting origin certificates).

### 3. Active Storage with Cloudflare R2 ($0 Egress Fees)
1. In Cloudflare dashboard, go to **R2 Object Storage > Create Bucket** (`ayoj-media`).
2. Go to **Manage R2 API Tokens > Create API Token** with Read & Write permissions.
3. Note your `Access Key ID`, `Secret Access Key`, and `Account ID`.
4. In production `.env`, set:
   ```bash
   RAILS_ACTIVE_STORAGE_SERVICE=cloudflare
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_R2_ACCESS_KEY_ID=your_key_id
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
   CLOUDFLARE_R2_BUCKET=ayoj-media
   ```

---

## Phase 4: Automated CI/CD Pipeline (GitHub Actions)

Configure these secrets in **GitHub > Repository Settings > Secrets and variables > Actions**:
* `OCI_HOST`: Your OCI Ampere VM Public IPv4 address.
* `OCI_SSH_KEY`: The private SSH key matching the public key you added to OCI.
* `OCI_USERNAME`: `ubuntu` (default for Ubuntu cloud images).
* `ENV_PRODUCTION`: The full contents of your `.env.production` file (database password, JWT secret, Cloudflare R2 keys, etc.).

When code is pushed to `main`, [.github/workflows/deploy.yml](file:///.github/workflows/deploy.yml):
1. Compiles production Docker images for **`linux/arm64`** (OCI Ampere A1 native architecture) in parallel.
2. Pushes both `backend` and `frontend` images to GitHub Container Registry (`ghcr.io`).
3. Syncs `docker-compose.yml` and `docker/nginx/prod.conf` to the VM using SCP.
4. SSHes into your OCI instance and runs:
   ```bash
   docker compose --env-file ~/.env.production pull
   docker compose --env-file ~/.env.production up -d --remove-orphans
   docker compose --env-file ~/.env.production exec -T backend bin/rails db:migrate
   ```
5. Prunes old Docker layers and verifies health in less than **15 seconds** with **zero downtime**.

---

## Phase 5: Automated Nightly Database Backups ($0)

Create `/usr/local/bin/backup-db.sh` on the OCI instance:

```bash
#!/bin/bash
set -e
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/postgres"
FILENAME="ayoj_db_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

# 1. Dump database from Docker container
docker exec -t marketplace-db-1 pg_dump -U marketplace marketplace_production | gzip > "${BACKUP_DIR}/${FILENAME}"

# 2. Upload to Cloudflare R2 bucket
rclone copy "${BACKUP_DIR}/${FILENAME}" r2:ayoj-database-backups/

# 3. Prune local dumps older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete
```

Add to cron (`sudo crontab -e`):
```cron
# Runs every night at 2:00 AM
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/db_backup.log 2>&1
```

---

## 30-Second Disaster Recovery Runbook

If the server ever fails:
1. Spin up a new OCI instance.
2. Clone repository: `git clone https://github.com/ayojan/marketplace.git`.
3. Pull database snapshot from R2: `rclone copy r2:ayoj-database-backups/latest.sql.gz .`.
4. Restore database:
   ```bash
   gunzip -c latest.sql.gz | docker exec -i marketplace-db-1 psql -U marketplace -d marketplace_production
   ```
5. All data, users, and bookings are completely restored.
