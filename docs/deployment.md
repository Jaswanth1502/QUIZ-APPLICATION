# Deployment

## Docker Compose

From the project root:

```bash
cp .env.example .env
docker compose up --build
```

Compose starts MySQL, waits for database health, starts Spring Boot, then serves the built React application through Nginx. The frontend proxies only its static application; Axios targets the configured backend URL.

## Production recommendations

Build immutable images, place a TLS reverse proxy or load balancer in front, use a managed MySQL service, inject secrets from a secret manager, use a restrictive CORS origin, run database migrations as a controlled release step, disable sample data, publish health checks, and centralize logs.

## Standalone builds

```bash
cd backend
mvn clean package

cd ../frontend
npm ci
npm run build
```

The backend artifact is under `backend/target`. The frontend static bundle is under `frontend/dist`.
