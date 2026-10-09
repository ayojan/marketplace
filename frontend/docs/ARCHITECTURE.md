# Marketplace Frontend

This is the Next.js frontend application for the Marketplace platform that connects service vendors with customers.

## Features

- **Next.js 14** with App Router
- **React 18** with Server Components
- **TypeScript** support
- **Context API** for state management
- **Axios** for API communication
- **Protected Routes** with role-based access control
- **Responsive Design** with Tailwind CSS
- **SEO Optimization** with built-in metadata support
- **Performance Optimization** with automatic code splitting

## Getting Started

### Prerequisites

- Node.js (version 20.19+ or 22.12+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update the `.env.local` file with your backend API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

### Start Production Server

Start the production server:
```bash
npm run start
```

## Project Structure

```
app/                    # Next.js App Router pages
├── layout.js          # Root layout component
├── page.js            # Home page
├── login/page.js      # Login page
├── register/page.js   # Register page
├── marketplace/page.js # Marketplace page
├── services/page.js   # Services page
├── vendors/[id]/page.js # Dynamic vendor profile
├── customer/dashboard/page.js # Customer dashboard
├── vendor/dashboard/page.js   # Vendor dashboard
├── booking/[serviceId]/page.js # Booking flow
├── dashboard/page.js  # Dashboard redirect
├── unauthorized/page.js # Unauthorized page
└── not-found.js       # 404 page

src/                   # Shared application code
├── components/        # Reusable components
│   └── ProtectedRoute.jsx
├── contexts/         # React Context providers
│   ├── AuthContext.jsx    # Authentication state management
│   └── AppContext.jsx     # Global application state
├── pages/            # Page components (used by app router)
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── ...
├── services/         # API service layer
│   └── api.jsx
├── utils/           # Utility functions
├── App.css          # Global styles
└── index.css        # Base styles
```

## State Management

The application uses React Context API for state management:

### AuthContext
- User authentication state
- Login/logout functionality
- JWT token management
- User profile information

### AppContext
- Global application state
- Notifications
- Search filters
- Loading states
- Error handling

## API Integration

The application communicates with the Rails backend through a centralized API service:

- **Authentication**: Login, register, logout
- **Services**: CRUD operations for service listings
- **Vendors**: Vendor profiles and information
- **Bookings**: Booking management
- **File Uploads**: Image and document uploads

## Routing

The application uses React Router with the following route structure:

- `/` - Home page
- `/login` - User login
- `/register` - User registration
- `/marketplace` - Public marketplace
- `/services` - Service search
- `/vendors/:id` - Vendor profile
- `/customer/dashboard` - Customer dashboard (protected)
- `/vendor/dashboard` - Vendor dashboard (protected)
- `/booking/:serviceId` - Booking flow (protected)

## Authentication

The application implements JWT-based authentication with:

- Automatic token refresh
- Protected routes based on user roles
- Persistent login state
- Automatic logout on token expiration

## Future Enhancements

This is the foundation setup. Future tasks will implement:

- Complete UI components
- Advanced search functionality
- Real-time messaging
- Payment integration
- File upload capabilities
- Notification system
- Performance optimizations

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
| `REACT_APP_NAME` | Application name | `Marketplace` |
| `REACT_APP_VERSION` | Application version | `1.0.0` |

> When the frontend and backend share a hostname (for example via the local nginx proxy), you may point this variable at `/api` and let the proxy strip the prefix. For standalone deployments, configure it with the backend origin (`https://api.ayoj.in` on production).
