# Local Development Setup

This guide will help you set up the Ayoj Marketplace on your local machine.

## Recommended: Host-based Development

Running the application servers directly on your host machine provides the fastest development feedback and easier access to debugging tools (like `rails console` or `byebug`).

### 1. Prerequisite: Docker for Dependencies
We use Docker to manage the database and cache, ensuring a consistent environment with minimal manual setup.

```bash
docker-compose -f docker-compose.local.yml up -d db redis
```

### 2. Backend Setup (Rails)

Ensure you have Ruby (check `backend/.ruby-version`) and PostgreSQL client libraries installed on your machine.

```bash
cd backend
# Install dependencies
bundle install

# Prepare the database (assumes db is running in Docker)
# PostgreSQL is exposed on port 5432
rails db:prepare

# Start the server on port 3001
rails s -p 3001
```

**Common Rails Commands:**
- `rails console` - Access the Rails console
- `bundle exec rspec` - Run tests
- `rails db:migrate` - Run migrations

### 3. Frontend Setup (Next.js)

```bash
cd frontend
# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

---

## Alternative: Full Containerized Development

If you prefer to run everything inside Docker, we provide a `full` profile in `docker-compose.local.yml`.

```bash
# Start all services (db, redis, backend, frontend)
docker-compose -f docker-compose.local.yml --profile full up -d
```

**Note:** When running in this mode, the backend is available at `http://localhost:3001` and the frontend at `http://localhost:3000`.

### Troubleshooting

- **Database Connection:** If Rails cannot connect to the database, ensure the `DATABASE_URL` or `database.yml` points to `localhost:5432` (or `db:5432` if running inside Docker).
- **Redis Connection:** Ensure `REDIS_URL` points to `redis://localhost:6379`.
