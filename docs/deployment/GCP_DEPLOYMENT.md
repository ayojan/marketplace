# ☁️ GCP Compute Engine Backend Deployment Runbook (Always Free Tier)

This runbook guides you through deploying the **Ayoj Rails 8 API** on a **Google Cloud Platform (GCP) Compute Engine `e2-micro`** instance for **$0.00/month** with automated GitHub Actions CI/CD, Caddy reverse proxy (auto-SSL), and zero-downtime rolling deploys.

---

## 🏗 Architecture Overview

```
                                  [ Cloudflare / Registrar DNS ]
                                                │
                                    api.ayoj.in │ (A-record)
                                                ▼
┌─────────────────────────────────── GCP e2-micro VM (us-central1) ───────────────────────────────────┐
│                                                                                                     │
│   Ports 80/443 (TCP/UDP) ───► [ Caddy 2 Reverse Proxy ]                                             │
│                                      │ (HTTP/3, Auto-SSL via Let's Encrypt, Gzip/Zstd)              │
│                                      ▼                                                              │
│                                [ Rails 8 API ] (Puma single-mode + Solid Queue + jemalloc)         │
│                                127.0.0.1:3000                                                       │
│                                                                                                     │
│   Memory Safety: 1 GB Physical RAM + 4 GB Fast Swapfile (swappiness=10)                            │
│   Storage: 30 GB Standard Persistent Disk (Docker log rotation: max 10MB)                          │
└───────────────────────────────────────┬───────────────────────────────┬─────────────────────────────┘
                                        │                               │
                                        ▼                               ▼
                     [ Supabase PostgreSQL ]              [ Cloudflare R2 Storage ]
                     (Data & Active Job Queue)            (Images & Media, $0 Egress)
```

---

## 💰 GCP Always Free Tier Verification

To guarantee **$0.00 charges**, your VM configuration must match GCP's Always Free limits:

| Resource | Free Tier Limit | Our Configuration | Free Tier Qualified? |
| :--- | :--- | :--- | :--- |
| **Instance Type** | 1 `e2-micro` (2 vCPUs, 1 GB RAM) | `e2-micro` |  Yes |
| **Region** | `us-central1`, `us-east1`, or `us-west1` | `us-central1` (Iowa) |  Yes |
| **Boot Disk** | Up to 30 GB **Standard Persistent Disk** | 30 GB `pd-standard` (Ubuntu 24.04 Minimal) |  Yes |
| **Egress** | 1 GB/month free out-of-region | Tiny JSON responses only (media goes to Cloudflare R2) |  Yes |
| **Monthly Limit** | Up to 744 hours per month | 1 VM running 24/7 all month |  Yes |

> [!IMPORTANT]
> Choose **Standard persistent disk** (`pd-standard`), NOT Balanced SSD or SSD (`pd-ssd`), as only standard persistent disk is covered by the Always Free quota!

---

## Phase 1: Provision the GCP Compute Engine VM

### Option A: Via `gcloud` CLI (Fastest & 100% Precise)

If you have the Google Cloud SDK (`gcloud`) installed locally:

```bash
# 1. Set your GCP project
gcloud config set project YOUR_PROJECT_ID

# 2. Create the Always Free e2-micro VM instance
gcloud compute instances create ayoj-backend \
    --project=YOUR_PROJECT_ID \
    --zone=us-central1-a \
    --machine-type=e2-micro \
    --network-interface=network-tier=STANDARD,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --tags=http-server,https-server \
    --create-disk=auto-delete=yes,boot=yes,device-name=ayoj-backend,image=projects/ubuntu-os-cloud/global/images/family/ubuntu-2404-lts-amd64,mode=rw,size=30,type=pd-standard

# 3. Create firewall rules for HTTP, HTTPS, and HTTP/3 QUIC
gcloud compute firewall-rules create allow-http-https \
    --allow=tcp:80,tcp:443,udp:443 \
    --target-tags=http-server,https-server \
    --description="Allow HTTP, HTTPS and HTTP3 QUIC"
```

### Option B: Via Google Cloud Console (Web UI)

1. Open [Google Cloud Console > Compute Engine > VM Instances](https://console.cloud.google.com/compute/instances).
2. Click **Create Instance**.
3. Configure the following fields:
   - **Name:** `ayoj-backend`
   - **Region:** `us-central1 (Iowa)`
   - **Zone:** `us-central1-a` (or any `us-central1` zone)
   - **Machine Configuration:**
     - Series: **E2**
     - Machine type: **e2-micro** (2 vCPU, 1 GB memory)
   - **Boot Disk:** Click **Change**:
     - Operating system: **Ubuntu**
     - Version: **Ubuntu 24.04 LTS** (or 22.04 LTS)
     - Boot disk type: **Standard persistent disk** *(Important: Do NOT select Balanced SSD)*
     - Size: **30 GB**
     - Click **Select**.
   - **Firewall:**
     - Check **Allow HTTP traffic**
     - Check **Allow HTTPS traffic**
   - **Advanced options > Networking:**
     - Under Network interfaces, ensure external IPv4 address is enabled.
4. Click **Create**.
5. Once created, note your instance's **External IP address** (e.g. `34.123.45.67`).

---

## Phase 2: DNS Configuration

Point your domain name to your newly created GCP external IP:

1. Open your DNS provider (Cloudflare, Namecheap, GoDaddy, etc.).
2. Add an **A Record**:
   - **Type:** `A`
   - **Name / Host:** `api` (or `@` if apex)
   - **IPv4 Address:** `<GCP_EXTERNAL_IP>` (e.g. `34.123.45.67`)
   - **TTL:** Auto or 300 seconds
   - *(If using Cloudflare)*: Set Proxy status to **DNS Only (Gray Cloud)** initially so Caddy can automatically issue the Let's Encrypt TLS certificate. Once issued, you can enable the proxy if desired.

---

## Phase 3: Bootstrap the GCP Server

SSH into your new VM:

```bash
# Via gcloud
gcloud compute ssh ayoj-backend --zone=us-central1-a

# OR via standard SSH:
ssh <your-username>@<GCP_EXTERNAL_IP>
```

Once inside the VM, run the automated bootstrap script:

```bash
# 1. Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/ayojan/marketplace/main/deploy/setup-gcp-server.sh -o setup.sh
# (Or copy deploy/setup-gcp-server.sh to the server)
sudo bash setup.sh

# 2. Apply docker group changes to your current session
newgrp docker

# 3. Create your production environment file
cd /opt/ayoj-backend
cp .env.example .env
nano .env
```

### Fill in `/opt/ayoj-backend/.env`:

Generate secrets locally or in terminal with `openssl rand -hex 64`:

```bash
openssl rand -hex 64
```

Update `/opt/ayoj-backend/.env` with:
- `SECRET_KEY_BASE`: Generated 64-byte hex key
- `JWT_SECRET_KEY`: Generated 64-byte hex key
- `DEVISE_SECRET_KEY`: Generated 64-byte hex key
- `DATABASE_URL`: Supabase connection pooler URI (`aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require`)
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: Cloudflare R2 access key
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: Cloudflare R2 secret
- `CLOUDFLARE_R2_BUCKET`: `ayoj-media`
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `RESEND_API_KEY`: Resend API key
- `DOMAIN`: `api.ayoj.in`

---

## Phase 4: Configure GitHub Container Registry (GHCR)

By default, Docker images pushed to GHCR are private. To allow your GCP server to pull the image:

### Option A: Make the Package Public (Recommended & Simplest)
1. Go to your GitHub profile or organization: `https://github.com/orgs/ayojan/packages` (or `https://github.com/ayojan?tab=packages`).
2. Once the first GitHub Action run pushes `marketplace-backend`, click on it.
3. Click **Package settings** (on the right).
4. Scroll to **Danger Zone** > Click **Change visibility** > Select **Public**.
5. *Result:* Your server can pull `ghcr.io/ayojan/marketplace-backend:latest` without needing any Docker credentials!

### Option B: Private Authentication (If you keep the package private)
On the GCP VM, authenticate Docker with a GitHub Personal Access Token (PAT with `read:packages` permission):
```bash
echo "<YOUR_GITHUB_PAT>" | docker login ghcr.io -u <YOUR_GITHUB_USERNAME> --password-stdin
```

---

## Phase 5: Configure GitHub Actions Secrets

In your GitHub repository:
1. Navigate to **Settings > Secrets and variables > Actions**.
2. Under **Repository secrets**, click **New repository secret** and add:

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `GCP_HOST` | `<GCP_EXTERNAL_IP>` | Public IP of the VM (e.g. `34.123.45.67`) |
| `GCP_USERNAME` | `<SSH_USERNAME>` | Your SSH user on the VM (e.g. `ubuntu` or `ajeet`) |
| `GCP_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Private SSH key matching the public key on the VM |
| `GCP_SSH_PORT` | `22` | Optional (defaults to 22) |

> [!TIP]
> **Need a dedicated deploy SSH key?**
> Run on your local machine:
> ```bash
> ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/ayoj_deploy_key
> ```
> Add the contents of `~/.ssh/ayoj_deploy_key.pub` to `/home/<user>/.ssh/authorized_keys` on the GCP VM.
> Paste the private key (`~/.ssh/ayoj_deploy_key`) into the `GCP_SSH_KEY` GitHub secret.

---

## Phase 6: Run Initial Deployment

1. On GitHub, navigate to **Actions > Deploy Backend to GCP**.
2. Click **Run workflow** on `main` branch (or simply `git push origin main` after merging).
3. The workflow will:
   - Build the optimized multi-stage Rails Docker image with jemalloc on GitHub cloud runners.
   - Push to `ghcr.io/ayojan/marketplace-backend:latest`.
   - SSH into the GCP VM.
   - Sync `docker-compose.prod.yml`, `Caddyfile`, and `deploy.sh` to `/opt/ayoj-backend/`.
   - Run `/opt/ayoj-backend/deploy.sh`.
   - Run database migrations (`bundle exec rails db:prepare`).
   - Verify health check (`http://localhost:3000/up`).
   - Caddy auto-provisions TLS certificate for `api.ayoj.in`.

---

## Phase 7: Verification & Health Checks

Test the live API endpoint from your terminal or browser:

```bash
# 1. Verify healthcheck endpoint
curl -i https://api.ayoj.in/up
# Expected HTTP 200 OK

# 2. Verify JSON healthcheck endpoint with database connectivity
curl -i https://api.ayoj.in/health
# Expected:
# {
#   "status": "ok",
#   "database": "connected",
#   "cache": "connected",
#   "solid_queue": "connected"
# }
```

### Useful Server Commands

SSH into `/opt/ayoj-backend` on the VM:

```bash
# Check running containers
docker compose -f docker-compose.prod.yml ps

# View live Rails logs
docker compose -f docker-compose.prod.yml logs -f web

# View Caddy reverse proxy logs
docker compose -f docker-compose.prod.yml logs -f caddy

# Check RAM and Swap usage (RAM should hover ~200-300MB)
free -h

# Check Disk space (should be under 8GB / 30GB)
df -h /

# Run Rails Console inside container
docker compose -f docker-compose.prod.yml exec web ./bin/rails console

# Run Database Migrations manually
docker compose -f docker-compose.prod.yml exec web ./bin/rails db:migrate
```

---

## 🛡️ Zero-Downtime Guarantee & Recovery

- When a new commit is pushed to `main`, GitHub Actions builds the image remotely.
- `deploy.sh` pulls the new image and re-creates `web` container.
- If Puma fails to start or database connectivity drops, the script detects this within 120s, alerts the build pipeline, and outputs container logs.
- Automatic Let's Encrypt certificates are safely retained in Docker volume `caddy_data`, preventing rate limits.
- Swap (`/swapfile`) prevents memory spikes from triggering Linux OOM killer on the 1 GB physical memory instance.
