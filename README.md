# AYOJ Marketplace

A modern marketplace platform for photographers and customers.

## Quick Start

For local development, we recommend running the databases in Docker and the Rails/Next.js apps on your host machine for the best experience.

### 1. Start Databases
```bash
docker-compose -f docker-compose.local.yml up -d db redis
```

### 2. Setup & Start Backend
```bash
cd backend
bundle install
rails db:prepare
rails s -p 3001
```

### 3. Setup & Start Frontend
```bash
cd frontend
npm install
npm run dev
```

## Documentation

- [Local Setup Guide](docs/development/LOCAL_SETUP.md)
- [Backend Documentation](backend/docs/)
- [Frontend Documentation](frontend/docs/)
- [Deployment Guide](docs/deployment/DEPLOYMENT.md)
- [Docker Configuration](docs/development/DOCKER.md)

## Project Structure

- `backend/`: Rails 7 API with GraphQL.
- `frontend/`: Next.js 14 with TypeScript and Tailwind CSS.
- `docs/`: Comprehensive project documentation.
- `docker/`: Shared Docker configurations (Nginx, etc).
