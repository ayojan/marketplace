# Reverse Proxy Architecture: Nginx, Frontend, and Backend

This document explains how the Ayoj Marketplace uses Nginx as a Reverse Proxy to unify the Next.js frontend and Rails backend into a single, seamless application.

## 1. High-Level Flow

```mermaid
flowchart TD
    classDef edge fill:#f8fafc,stroke:#475569,stroke-width:1.5px,color:#0f172a;
    classDef proxy fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0c4a6e;
    classDef app fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f;
    classDef data fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d;

    User["User Browser / Client"]:::edge -->|"HTTPS (Port 443)"| CF["Cloudflare Edge (SSL, CDN, WAF)"]:::edge
    CF -->|"HTTP (Port 80) + CF-Connecting-IP"| Nginx["Nginx Reverse Proxy"]:::proxy

    subgraph NginxRouting["Nginx Routing Hub (prod.conf)"]
        Nginx -->|"ayoj.in & www.ayoj.in /"| FE_Proxy["Proxy to Next.js"]:::proxy
        Nginx -->|"ayoj.in/_next/static/*"| Static_Proxy["Proxy to Next.js (1yr Cache)"]:::proxy
        Nginx -->|"ayoj.in/api/* (strip /api)"| BE_Proxy["Proxy to Rails API"]:::proxy
        Nginx -->|"api.ayoj.in/*"| BE_Proxy
        Nginx -->|"admin.ayoj.in & /admin"| Admin_Proxy["Proxy to ActiveAdmin"]:::proxy
        Nginx -->|"/assets/*, /up, /rails/active_storage/*"| BE_Proxy
    end

    subgraph DockerNet["Docker Internal Network (ayoj_network)"]
        direction TB
        FE_Proxy --> NextJS["Next.js 14 App (Port 3000)"]:::app
        Static_Proxy --> NextJS
        BE_Proxy --> Rails["Rails 8 API (Port 3000)"]:::app
        Admin_Proxy --> Rails

        NextJS -.->|"Internal SSR API (http://backend:3000)"| Rails
        Rails -->|"Primary Data & Solid Queue"| DB[("PostgreSQL 15")]:::data
        Rails -->|"Cache & Rate Limiting"| Redis[("Redis 7")]:::data
    end
```

---

## 2. How it works in Ayoj

### The "Traffic Cop" Concept
Nginx acts as the single entry point (listening on port 80/443). Instead of the user talking directly to the frontend or backend, they talk only to Nginx. Nginx then looks at the **URL Path** to decide where to send the message.

### Routing Rules (from `docker/nginx/prod.conf`)

| Request Path | Destination | Internal Logic |
| :--- | :--- | :--- |
| `ayoj.in/` (or `localhost/`) | **Frontend** | Direct proxy to Next.js container (`frontend:3000`) for SSR. |
| `ayoj.in/_next/static/*` | **Frontend** | Proxied to Next.js with 1-year immutable edge caching. |
| `ayoj.in/api/*` | **Backend** | Rewrites `/api/*` to `/*` and proxies to Rails (`backend:3000`). |
| `ayoj.in/rails/active_storage/*` | **Backend** | Direct proxy to Rails Active Storage image processor. |
| `ayoj.in/up` | **Backend** | Direct proxy to Rails healthcheck probe. |
| `admin.ayoj.in/` | **Backend** | Redirects to `/admin` ActiveAdmin portal. |
| `ayoj.in/assets/*` | **Backend** | Direct proxy for ActiveAdmin stylesheets & javascripts. |
| `api.ayoj.in/*` | **Backend** | Direct API subdomain endpoint for mobile clients. |

---

## 3. Why use this instead of a "Public URL" for Next.js?

While you can run Next.js and Rails on separate public URLs (e.g., `app.ayoj.com` and `api.ayoj.com`), the Reverse Proxy approach offers four critical advantages:

### A. Zero CORS Issues
Browsers block scripts on one domain (frontend) from talking to another (backend) for security. This is called **CORS**. 
*   **Without Proxy**: You must configure Rails to "allow" the frontend URL explicitly.
*   **With Proxy**: Since both are served from the same domain (`localhost`), the browser sees them as the same origin. **CORS effectively disappears.**

### B. Path Rewriting
The frontend can call `/api/services`. Nginx automatically strips the `/api` prefix before it hits Rails. This keeps your Rails routes clean (`/services`) while maintaining a logical structure for the frontend.

### C. Unified SSL Termination
In production, you only need **one** SSL certificate installed on Nginx. Nginx handles the heavy encryption/decryption work, and communicates with the internal containers over fast, unencrypted HTTP.

### D. Security & Obscurity
Your actual application servers (Next.js and Rails) are hidden inside a private Docker network. They don't even need to expose ports to the public internet. This makes it much harder for attackers to target your database or internal services directly.

---

## 4. Summary of Ties
*   **Next.js** handles the UI and initial page loads.
*   **Rails** handles the data, business logic, and database.
*   **Nginx** is the glue that makes them appear as one single application to the user.
