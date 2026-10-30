# Frontend Architecture

The frontend is a Next.js 14 application using the App Router, React 18, TypeScript, and Tailwind CSS. It is the browser-facing application for customers and vendors; business rules and persistence remain in the Rails backend.

## System Context

```mermaid
flowchart TD
    classDef client fill:#f8fafc,stroke:#475569,stroke-width:1.5px,color:#0f172a;
    classDef edge fill:#e0f2fe,stroke:#0284c7,stroke-width:1.5px,color:#0c4a6e;
    classDef frontend fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f;
    classDef backend fill:#f3e8ff,stroke:#7e22ce,stroke-width:1.5px,color:#3b0764;
    classDef data fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d;

    User["User (Customer / Vendor)"]:::client --> Browser["Web Browser"]:::client

    Browser -->|"HTTP/HTTPS"| Edge["Cloudflare Edge + Nginx Proxy"]:::edge

    subgraph AppServer["Docker Host Environment (ayoj_network)"]
        direction TB

        subgraph NextServer["Next.js 14 Container (frontend:3000)"]
            direction TB
            RSC["Server Components & SSR<br/>(app/)"]:::frontend
            Static["Static Assets & Chunks<br/>(_next/static)"]:::frontend
        end

        subgraph ClientRuntime["Browser Client Runtime"]
            direction TB
            UI["Client Components<br/>(components/)"]:::frontend
            State["AuthContext & tokenService"]:::frontend
            Axios["Axios API Client<br/>(lib/api.ts)"]:::frontend
            UI <--> State
            UI --> Axios
        end

        subgraph RailsServer["Rails 8 API Container (backend:3000)"]
            REST["REST Endpoints<br/>(/auth, /services, /bookings...)"]:::backend
            Puma["Puma 8 + Solid Queue"]:::backend
            REST --> Puma
        end

        DB[("PostgreSQL 15")]:::data
        Redis[("Redis 7")]:::data
        Puma --> DB
        Puma --> Redis
    end

    Edge -->|"ayoj.in / (SSR)"| RSC
    Edge -->|"_next/static/*"| Static
    Edge -->|"/api/* (Rewritten to /*)"| REST

    Browser --> ClientRuntime
    Axios -->|"Bearer JWT to /api/*"| Edge
    RSC -.->|"Internal SSR Fetch (http://backend:3000)"| REST
```

## Frontend Layers

| Layer | Location | Responsibility |
|---|---|---|
| Route entry points | `app/` | App Router pages, root layout, error and not-found boundaries |
| Feature and shared UI | `components/` | Booking, marketplace, vendor, navigation, auth, and reusable UI components |
| Client state | `lib/contexts/`, `lib/tokenService.js` | Authenticated user state, shared UI state, and browser token persistence |
| API boundary | `lib/api.ts` | Axios client, base URL, JWT authorization header, and unauthorized-response handling |
| Static/mock data | `lib/data/`, `lib/mockVendorData.ts` | Development and presentation data; not the production source of truth |

### Routing and rendering

Routes live under `app/`; there is no React Router or `src/` application directory. The root layout installs the `AuthProvider` and `AppProvider`. Interactive components opt into client rendering where needed, while Next.js retains its normal App Router rendering model for route entry points.

The principal route areas are:

- Public discovery: `/`, `/marketplace`, `/services`, `/vendors`, and `/vendors/[id]`.
- Authentication: `/login` and `/register`.
- Customer flows: `/customer`, `/customer/dashboard`, `/customer/bookings`, and `/customer/favorites`.
- Vendor flows: `/vendor`, `/vendor/dashboard`, `/vendor/bookings`, and `/vendor/portfolio`.
- Booking flows: `/booking` and `/booking/[serviceId]`.

## Authentication and API Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as AuthContext
    participant T as tokenService
    participant C as Axios client
    participant R as Rails API

    B->>A: Sign in or register
    A->>C: POST /auth/login or /auth/register
    C->>R: Credentials
    R-->>C: User and JWT
    C-->>A: Auth response
    A->>T: Persist token and user
    B->>C: Protected API request
    C->>T: Read unexpired token
    C->>R: Authorization: Bearer JWT
    R-->>C: Resource or 401
    alt 401 response
        C->>T: Clear auth data
    end
```

`NEXT_PUBLIC_API_URL` identifies the backend origin. It defaults to `http://localhost:3001` for local development. In a same-origin proxy deployment it can be `/api`; the proxy removes that prefix before forwarding to Rails.

## Deployment Boundary

The production Compose architecture places Nginx before the Next.js frontend and Rails backend on the single OCI host. Nginx serves the frontend at `/`, forwards `/api/*` to Rails after rewriting the prefix, and forwards Rails health (`/up`) and Active Storage paths (`/rails/active_storage/*`). The frontend connects directly to Rails at `http://backend:3000` for SSR and makes no direct connection to PostgreSQL or Redis.

## Development

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3001` when running the frontend directly alongside the Rails server.
