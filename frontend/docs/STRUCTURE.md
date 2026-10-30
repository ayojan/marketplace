# Frontend Structure - Next.js 14 App Router

This document outlines the frontend structure of the Ayoj Marketplace, built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, and **Tailwind CSS**.

---

## Directory Tree

```
frontend/
├── app/                           # Next.js 14 App Router (pages, layouts, metadata)
│   ├── layout.tsx                 # Root layout (Auth & Location providers, Toast notifications)
│   ├── page.tsx                   # Marketplace home page
│   ├── error.tsx                  # Root error boundary
│   ├── global-error.tsx           # Global catch-all error boundary
│   ├── not-found.tsx              # Custom 404 page
│   ├── manifest.ts                # PWA web app manifest
│   ├── robots.ts                  # Robots.txt generator
│   ├── sitemap.ts                 # Dynamic XML sitemap generator
│   │
│   ├── marketplace/               # Public discovery directory
│   │   ├── layout.tsx             # Directory layout & filters
│   │   └── page.tsx               # Service & category search
│   ├── vendors/                   # Vendor profile & showcase
│   │   ├── layout.tsx             # Vendor pages layout
│   │   ├── page.tsx               # Vendor directory
│   │   └── [id]/page.tsx          # Dynamic vendor profile & services
│   ├── services/                  # Service catalog
│   │   └── page.tsx               # Service search
│   ├── booking/                   # Multi-step booking checkout
│   │   ├── page.tsx               # General booking entry
│   │   └── [serviceId]/page.tsx   # Service-specific 3-step booking flow
│   ├── customer/                  # Customer dashboard & portal
│   │   ├── page.tsx               # Customer dashboard root
│   │   ├── dashboard/page.tsx     # Celebration Passport & stats
│   │   ├── bookings/page.tsx      # Booking history & status tracker
│   │   └── favorites/page.tsx     # Saved & short-listed vendors
│   ├── vendor/                    # Vendor workspace & management portal
│   │   ├── page.tsx               # Vendor workspace root
│   │   ├── dashboard/page.tsx     # Business metrics & pending requests
│   │   ├── bookings/page.tsx      # Order management & status transitions
│   │   ├── portfolio/page.tsx     # Media gallery management
│   │   ├── services/page.tsx      # Packages & pricing management
│   │   ├── calendar/page.tsx      # Availability schedule
│   │   ├── settings/page.tsx      # Business profile & bank info
│   │   └── onboarding/page.tsx    # Multi-step vendor onboarding wizard
│   ├── login/page.tsx             # User authentication (Email + Google OAuth)
│   ├── register/page.tsx          # Account creation with role selection
│   ├── unauthorized/page.tsx      # Access denied fallback
│   └── photographer/[id]/page.tsx # Legacy photographer alias route
│
├── components/                    # Feature-sliced component architecture
│   ├── ui/                        # Radix UI & shadcn/ui design primitives
│   │   ├── button.tsx             # Button variants (default, outline, ghost)
│   │   ├── card.tsx               # Content container cards
│   │   ├── dialog.tsx             # Accessible modals & overlays
│   │   ├── dropdown-menu.tsx      # Context menus & actions
│   │   ├── sheet.tsx              # Mobile navigation drawers
│   │   ├── tabs.tsx               # Segmented view controllers
│   │   ├── sonner.tsx             # Toast notifications
│   │   └── [other primitives]    # Badge, avatar, input, select, etc.
│   │
│   ├── auth/                      # Authentication components
│   │   ├── AuthLoginForm.tsx      # Email/password login with JWT
│   │   ├── AuthRegisterForm.tsx   # Customer/Vendor account registration
│   │   ├── GoogleSignInButton.tsx # One-tap Google Identity Services OAuth
│   │   ├── AuthPhoneOtpModal.tsx  # Mobile OTP verification modal
│   │   └── AuthRoleSelector.tsx   # Role toggle (Customer vs Vendor)
│   │
│   ├── booking/                   # Booking flow components
│   │   ├── BookingHeaderStepper.tsx       # Step 1-2-3 visual progress
│   │   ├── BookingStep1Details.tsx        # Event type, date, and location
│   │   ├── BookingStep2Schedule.tsx       # Duration, timing, and requirements
│   │   ├── BookingStep3Review.tsx         # Price breakdown & review
│   │   ├── BookingOrderSummarySidebar.tsx # Real-time price summary
│   │   └── BookingMobileActionBar.tsx     # Responsive bottom checkout bar
│   │
│   ├── customer/                  # Customer portal components
│   │   ├── CustomerProfileHeader.tsx      # Customer header & avatar
│   │   ├── CelebrationPassportCard.tsx    # Gamified event progress
│   │   ├── CustomerDreamTeamTracker.tsx   # Booked vendor team status
│   │   ├── CustomerBookingsTab.tsx        # Active & past bookings
│   │   └── CustomerSavedTab.tsx           # Favorited vendors
│   │
│   ├── vendor/                    # Vendor workspace components
│   │   ├── VendorProfileHeader.tsx        # Public profile cover & details
│   │   ├── VendorHeroMosaic.tsx           # Instagram-style portfolio mosaic
│   │   ├── VendorPackagesSection.tsx      # Service tiers & pricing
│   │   ├── VendorPortfolioSection.tsx     # Portfolio albums & lightbox
│   │   ├── VendorReviewsSection.tsx       # Verified client ratings & reviews
│   │   ├── VendorOnboardingWizard.tsx     # 4-step vendor application
│   │   ├── VendorCalendarPicker.tsx       # Blackout dates & schedule
│   │   └── VendorBookingSidebar.tsx       # Sticky instant inquiry widget
│   │
│   ├── home/                      # Modular landing page sections
│   │   ├── HomeHero.tsx                   # Hero banner with city search
│   │   ├── HomeCategoryGrid.tsx           # Category cards (Photography, Decor, etc.)
│   │   ├── HomeFeaturedVendors.tsx        # Handpicked top vendors
│   │   ├── HomeTrustPromise.tsx           # 100% verified & escrow guarantees
│   │   ├── HomeOccasionsSection.tsx       # Weddings, Birthdays, Corporate
│   │   └── HomeHowItWorks.tsx             # 3-step customer journey
│   │
│   ├── header/                    # Global navigation
│   │   ├── HeaderNavLinks.tsx             # Main desktop menu
│   │   ├── HeaderCityPicker.tsx           # Location switcher dropdown
│   │   ├── HeaderUserMenu.tsx             # Profile, Dashboard & Logout dropdown
│   │   └── HeaderMobileDrawer.tsx         # Mobile hamburger menu
│   │
│   ├── motion/                    # Framer Motion micro-interactions
│   │   ├── InView.tsx                     # Viewport entry triggers
│   │   ├── TextLoop.tsx                   # Cycling headline text
│   │   ├── Spotlight.tsx                  # Mouse-following glow effect
│   │   └── Magnetic.tsx                   # Magnetic hover buttons
│   │
│   ├── ProtectedRoute.tsx         # Client route protection boundary
│   ├── AyojLogo.tsx               # Scalable brand vector logo
│   ├── StarRating.tsx             # Fractional star review display
│   ├── ReviewFormModal.tsx        # Client review submission modal
│   ├── NotificationDropdown.tsx   # Activity & booking updates
│   ├── Footer.tsx                 # Site-wide responsive footer
│   └── __tests__/                 # Component Jest & Testing Library tests
│
├── lib/                           # Core utilities, API clients & state
│   ├── api.ts                     # Central Axios client (SSR vs Browser routing)
│   ├── tokenService.ts            # JWT storage (LocalStorage + Cookie expiry)
│   ├── recentlyViewed.ts          # Client-side recent vendor tracking
│   ├── contexts/                  # React state providers
│   │   ├── AuthContext.tsx        # User session, JWT auth & OAuth
│   │   └── LocationContext.tsx    # Selected city & geographic filters
│   ├── seo/                       # SEO & Structured Data helpers
│   │   └── directoryMetadata.ts   # OpenGraph, Twitter Cards & JSON-LD schema
│   └── __tests__/                 # Utility unit tests
│
├── types/                         # TypeScript interfaces & types
│   └── user.ts                    # User, Role, Vendor, and Session types
│
├── styles/                        # Styling & design system
│   └── globals.css                # Tailwind CSS v4 variables & base styles
│
├── public/                        # Static public assets
│   └── images/                    # Favicons, logos, and placeholder imagery
│
├── Dockerfile                     # Multi-stage production container build (standalone)
├── Dockerfile.local               # Local development container build
├── next.config.js                 # Next.js config (standalone output, images)
├── tailwind.config.js             # Tailwind CSS tokens & color palette
├── tsconfig.json                  # TypeScript compiler settings & path aliases
└── package.json                   # Dependencies and npm scripts
```

---

## Architectural Principles

### 1. Hybrid Rendering Model (RSC + Client Components)
- **Server Components (Default)**: All pages under `app/` are React Server Components by default. Data pre-fetching executes on the server without shipping JavaScript to the client.
- **Client Components (`'use client'`)**: Used selectively for interactive elements like forms (`AuthLoginForm`), stateful modals (`BookingStep1Details`), dropdowns, and motion animations.

### 2. Dual-Mode API Routing (`lib/api.ts`)
Next.js renders both on the server (during SSR) and in the user's browser (client hydration). `lib/api.ts` automatically switches based on execution context:
* **Server-Side (Node.js runtime)**: Routes to `INTERNAL_API_URL` (defaults to `http://backend:3000` within Docker network) for ultra-fast direct communication (<1ms latency).
* **Browser Runtime**: Routes to relative `/api` (`NEXT_PUBLIC_API_URL=/api`), eliminating CORS issues and letting Nginx proxy to Rails seamlessly.

```typescript
// lib/api.ts
const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '/api';
  }
  return process.env.INTERNAL_API_URL || 'http://backend:3000';
};
```

### 3. Path Aliases (`tsconfig.json`)
Clean absolute imports throughout the application without relative traversal:
* `@/components/*` → `./components/*`
* `@/lib/*` → `./lib/*`
* `@/app/*` → `./app/*`
* `@/styles/*` → `./styles/*`
* `@/types/*` → `./types/*`

### 4. Authentication Lifecycle
1. **Login / Register**: `AuthContext.tsx` invokes Rails endpoints (`/auth/login`, `/auth/register`, or `/auth/google`).
2. **Token Persistence**: `tokenService.ts` stores the JWT bearer token in `localStorage` and a secure cookie for SSR.
3. **Request Interceptor**: `lib/api.ts` automatically injects `Authorization: Bearer <token>` into outgoing requests.
4. **Expiration Handling**: A 401 response triggers automatic token eviction and redirects unauthenticated users to `/login`.

---

## Development & Build Commands

```bash
# Install dependencies
npm install

# Start Next.js development server (port 3000)
npm run dev

# Run TypeScript type-checking
npx tsc --noEmit

# Run unit and component test suite
npm run test

# Run ESLint validation
npm run lint

# Build production standalone bundle
npm run build

# Start production server locally
npm start
```
