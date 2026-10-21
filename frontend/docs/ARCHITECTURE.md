# Frontend Architecture

The frontend is a Next.js 14 application using the App Router, React 18, TypeScript, and Tailwind CSS. It is the browser-facing application for customers and vendors; business rules and persistence remain in the Rails backend.

## System Context

```mermaid
flowchart LR
    classDef client fill:#f8fafc,stroke:#475569,stroke-width:1.5px,color:#0f172a;
    classDef frontend fill:#e0f2fe,stroke:#0284c7,stroke-width:1.5px,color:#0c4a6e;
    classDef api fill:#f3e8ff,stroke:#7e22ce,stroke-width:1.5px,color:#3b0764;
    classDef data fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d;

    User([Customer / Vendor]):::client --> Browser[Web browser]:::client
    subgraph Next[Next.js 14 frontend]
        direction TB
        Routes[App Router pages<br/>app/]:::frontend
        UI[Page and shared components<br/>components/]:::frontend
        State[Client state<br/>AuthContext, AppContext, tokenService]:::frontend
        Client[Axios API client<br/>lib/api.js]:::frontend
        Routes --> UI
        UI <--> State
        UI --> Client
    end
    Browser --> Routes
    Client -->|Bearer JWT over HTTPS| REST[REST API endpoints]:::api
    REST --> Rails[Rails application]:::api
    Rails --> Data[(PostgreSQL / Solid Queue / Active Storage)]:::data
```

## Frontend Layers

| Layer | Location | Responsibility |
|---|---|---|
| Route entry points | `app/` | App Router pages, root layout, error and not-found boundaries |
| Feature and shared UI | `components/` | Booking, marketplace, vendor, navigation, auth, and reusable UI components |
| Client state | `lib/contexts/`, `lib/tokenService.js` | Authenticated user state, shared UI state, and browser token persistence |
| API boundary | `lib/api.js` | Axios client, base URL, JWT authorization header, and unauthorized-response handling |
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

The intended production Compose design places Nginx before the Next.js frontend and Rails backend. Nginx serves the frontend at `/`, forwards `/api/*` to Rails after removing `/api`, and forwards Rails health and Active Storage paths. The frontend should make no direct connection to PostgreSQL, Redis, Sidekiq, or Active Storage.

> Deployment review: `docker-compose.yml` names the Rails service `backend`, while `docker/nginx/prod.conf` currently points its `backend` upstream at `web:3000`. Align that upstream name before relying on the proxy topology shown above.

## Development

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3001` when running the frontend directly alongside the Rails server.
