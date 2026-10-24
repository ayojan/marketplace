# 🚀 Ayoj Deployment Guide

This guide explains how to deploy the Ayoj full-stack application for free using industry-standard services.

## 🏗 Architecture Overview

- **Frontend:** Next.js on [Vercel](https://vercel.com) (`ayoj.in`)
- **Backend:** Rails API on [Google Cloud Platform (GCP) Compute Engine e2-micro](GCP_DEPLOYMENT.md) (`api.ayoj.in`) *(Always Free Tier - 24/7 without sleeping)*
- **Database:** PostgreSQL on [Supabase](https://supabase.com)
- **Object Storage:** Cloudflare R2 (`ayoj-media` - 10 GB free, $0 egress)

> [!NOTE]
> For step-by-step instructions on deploying the backend to GCP Compute Engine (`e2-micro`), refer to the dedicated **[GCP Deployment Runbook](GCP_DEPLOYMENT.md)**.

---

## Phase 1: Managed Services Setup

### 1. Database (Supabase)
1. Create a project at [Supabase](https://supabase.com).
2. Navigate to **Project Settings > Database**.
3. Copy the **Connection String (URI)**. It looks like:
   `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`
4. Replace `[PASSWORD]` with your actual database password.

### 2. Redis (Upstash)
1. Create a Redis database at [Upstash](https://upstash.com).
2. Copy the **Redis URL** from the dashboard.
   `redis://default:[PASSWORD]@your-url.upstash.io:6379`

---

## Phase 2: Backend Deployment (Render.com)

1. Sign up for [Render](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository.
3. **Configuration:**
   - **Name:** `ayoj-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `./bin/render-build.sh`
   - **Start Command:** `bundle exec puma -C config/puma.rb`
4. **Environment Variables:**
   - `DATABASE_URL`: Your Supabase URI
   - `REDIS_URL`: Your Upstash URL
   - `RAILS_MASTER_KEY`: Content of your `backend/config/master.key`
   - `RAILS_ENV`: `production`
   - `RAILS_SERVE_STATIC_FILES`: `true`
   - `PORT`: `3000`
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID
   - `CLOUDFLARE_R2_ACCESS_KEY_ID`: R2 API Token Access Key ID
   - `   `: R2 API Token Secret Access Key
   - `CLOUDFLARE_R2_BUCKET`: `ayoj-media` (or your bucket name)

---

## Phase 3: Frontend Deployment (Vercel or Render)

### Option A: Vercel (Recommended)
1. Sign up for [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. **Configuration:**
   - **Root Directory:** Select the `frontend` folder.
   - **Framework Preset:** Next.js.
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: `https://api.ayoj.in`
5. Click **Deploy**.

### Option B: Render.com
1. Sign up for [Render](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository.
3. **Configuration:**
   - **Name:** `ayoj-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `./render-build.sh`
   - **Start Command:** `npm run start`
4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL`: `https://api.ayoj.in`
   - `NODE_VERSION`: `20.0.0` or higher
5. Click **Deploy**.

---

## Phase 4: Domain Configuration (ayoj.in)

### 1. Website (Vercel)
In Vercel **Settings > Domains**, add `ayoj.in`. Add these records to your domain registrar:
- **A Record:** `@` -> `76.76.21.21`
- **CNAME Record:** `www` -> `cname.vercel-dns.com`

### 2. API & Admin Portal (Render)
In Render, navigate to your `ayoj-backend` service > **Settings > Custom Domains**:
1. Add `api.ayoj.in`
2. Add `admin.ayoj.in`

Add these CNAME records to your DNS registrar (Cloudflare / GoDaddy / Namecheap):
- **CNAME Record:** `api` -> `ayoj-backend.onrender.com`
- **CNAME Record:** `admin` -> `ayoj-backend.onrender.com`

Render automatically provisions free, auto-renewing SSL/TLS certificates for both subdomains!

---

## Phase 5: Finalizing the Live App

### 1. Run Migrations
Once Render finishes the first build, go to the Render dashboard for your service:
1. Click on **Shell**.
2. Run: `bundle exec rails db:migrate`

### 2. Keep-Alive (Optional)
To prevent Render's free tier from sleeping, use [cron-job.org](https://cron-job.org) to ping `https://api.ayoj.in/up` every 14 minutes.