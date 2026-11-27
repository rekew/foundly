# Foundly

Foundly is a full-stack university project consisting of a React single-page application and a FastAPI REST API.

## Technology stack

| Layer            | Technology                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Frontend         | React, Vite, JavaScript, Tailwind CSS, Jotai, TanStack Query, Axios |
| Forms            | React Hook Form, Zod                                                |
| Frontend tooling | Oxlint, Prettier                                                    |
| Backend          | Python, FastAPI, SQLAlchemy (async), PostgreSQL, Alembic            |
| Backend tooling  | uv, Ruff, pytest                                                    |

## Project structure

```text
frontend/   React + Vite single-page application
backend/    FastAPI REST API and database migrations
```

The frontend is organized by pages, shared components, and feature modules. The backend follows a layered FastAPI structure with routers, schemas, models, services, and database access.

## Prerequisites

- Node.js 20 or newer
- pnpm 10 or newer
- Python 3.9 or newer
- [uv](https://docs.astral.sh/uv/)
- PostgreSQL 15 or newer

## Installation

Clone the repository and install each application separately.

### Backend

```bash
cd backend
cp .env.example .env
uv sync
```

Create the development database and update `DATABASE_URL` in `backend/.env` if your local PostgreSQL credentials differ:

```bash
createdb foundly
```

### Frontend

```bash
cd frontend
cp .env.example .env
pnpm install
```

## Environment variables

### Frontend

| Variable       | Description                                               | Default                        |
| -------------- | --------------------------------------------------------- | ------------------------------ |
| `VITE_API_URL` | Base URL of the backend API, including the version prefix | `http://localhost:8000/api/v1` |

### Backend

| Variable                      | Description                               | Default                                                         |
| ----------------------------- | ----------------------------------------- | --------------------------------------------------------------- |
| `APP_NAME`                    | Application name                          | `Foundly`                                                       |
| `ENVIRONMENT`                 | Runtime environment                       | `development`                                                   |
| `DATABASE_URL`                | Async PostgreSQL connection string        | `postgresql+asyncpg://postgres:postgres@localhost:5432/foundly` |
| `SECRET_KEY`                  | Secret used to sign authentication tokens | `change-me-in-production-use-a-long-random-value`               |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime in minutes          | `30`                                                            |
| `CORS_ORIGINS`                | Allowed frontend origins                  | `http://localhost:5173`                                         |
| `COOKIE_SECURE`               | Send the auth cookie only over HTTPS      | `false`                                                         |
| `COOKIE_SAMESITE`             | SameSite policy for the auth cookie       | `lax`                                                           |

Copy each `.env.example` file to `.env` before starting the applications. Never commit `.env` files.

## Development

Run the backend and frontend in separate terminals.

### Backend

```bash
cd backend
uv run uvicorn app.main:app --reload
```

The API is exposed under `/api/v1`, and authentication uses an httpOnly cookie.

### Frontend

```bash
cd frontend
pnpm dev
```

The frontend is available at `http://localhost:5173` by default.

## Common commands

### Frontend

```bash
pnpm dev          # Start the Vite development server
pnpm build        # Build for production
pnpm preview      # Preview the production build
pnpm lint         # Run Oxlint
pnpm format       # Format with Prettier
pnpm format:check # Check formatting with Prettier
```

### Backend

```bash
uv sync                    # Install dependencies
uv run uvicorn app.main:app --reload  # Start the development server
uv run pytest              # Run tests
uv run ruff check .        # Lint Python code
uv run ruff format .       # Format Python code
```

See the [frontend README](frontend/README.md) and [backend README](backend/README.md) for application-specific details.

## Deployment overview

- **Frontend:** run `pnpm build` and deploy the generated `dist/` directory to a static host such as Vercel, Netlify, or Cloudflare Pages. Set `VITE_API_URL` to the public backend URL including `/api/v1` during the build.
- **Backend:** deploy the FastAPI application with Uvicorn (for example on Render, Railway, Fly.io, or a container platform). Install dependencies with `uv sync --frozen --no-dev`, provide the production environment variables, and run `uv run uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- **Database:** use a managed PostgreSQL instance, set `DATABASE_URL` to its async connection string, and apply migrations with `uv run alembic upgrade head` before starting the API.
- **Configuration:** keep production secrets in the hosting platform's environment settings and restrict `CORS_ORIGINS` to the deployed frontend URL.
- **Cookies:** set `COOKIE_SECURE=true` in production. If the frontend and backend are on different sites, also set `COOKIE_SAMESITE=none` and add CSRF protection for cookie-authenticated state-changing requests.
