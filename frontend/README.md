# Foundly Frontend

The frontend is a React single-page application built with Vite and JavaScript. It provides the user interface for authentication, items, secondary entities, and user profiles.

## Requirements

- Node.js 20 or newer
- pnpm 10 or newer

## Technology stack

**Runtime dependencies**

- React and React DOM
- React Router
- Jotai
- TanStack Query
- Axios
- React Hook Form and Zod
- Tailwind CSS 4 with the Vite plugin
- Lucide React
- Sonner
- Recharts
- Vite PWA plugin

**Development dependencies**

- Vite
- `@vitejs/plugin-react`
- Oxlint
- Prettier
- `@ianvs/prettier-plugin-sort-imports`

## Getting started

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev
```

The development server runs at `http://localhost:5173` by default.

## Environment variables

| Variable       | Description                                               | Default                        |
| -------------- | --------------------------------------------------------- | ------------------------------ |
| `VITE_API_URL` | Base URL of the backend API, including the version prefix | `http://localhost:8000/api/v1` |

Variables must be prefixed with `VITE_` to be exposed to the client. Copy `.env.example` to `.env` and adjust values as needed. Do not commit `.env`.

## API client

All HTTP requests go through the shared Axios instance in `src/services/apiClient.js`.

- `withCredentials` is enabled, so the backend's httpOnly auth cookie is sent automatically.
- Responses resolve to the parsed response body.
- Errors are always normalized to `ApiError` from `src/services/apiError.js`.
- Axios `signal` is passed through, so requests can be cancelled with `AbortController`.

Example service usage from `src/services/auth.service.js`:

```js
import { getCurrentUser, login, logout } from './auth.service'

const controller = new AbortController()

try {
  const user = await login({
    email: 'student@example.com',
    password: 'password123',
    signal: controller.signal,
  })
  console.log(user)

  const currentUser = await getCurrentUser({ signal: controller.signal })
  console.log(currentUser)

  await logout()
} catch (error) {
  if (error.code === 'ABORTED') {
    return
  }

  // error.status, error.code, error.message and error.details
  console.error(error)
}
```

Do not call Axios directly from components or feature code. Add resource-specific functions to `src/services/` or the relevant feature instead.

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start the Vite development server    |
| `pnpm build`        | Create a production build in `dist/` |
| `pnpm preview`      | Preview the production build         |
| `pnpm lint`         | Run Oxlint                           |
| `pnpm format`       | Format files with Prettier           |
| `pnpm format:check` | Check files with Prettier            |

## Project structure

```text
src/
├── app/
│   └── layouts/          Application layouts
├── pages/                Route-level pages
├── components/
│   ├── ui/               Reusable UI primitives
│   └── common/           Shared application components
├── features/
│   ├── auth/             Authentication feature
│   ├── items/            Items feature
│   ├── secondary-entities/ Secondary entities feature
│   └── profile/          User profile feature
├── hooks/                Shared React hooks
├── services/             API clients and data access
├── store/                Jotai state
├── utils/                Shared utilities
└── styles/               Shared styles
```

Feature-specific components, hooks, and state should stay inside their feature folder. Only genuinely shared code belongs in the top-level folders.

## Styling and tooling

- **Tailwind CSS** is enabled through `@tailwindcss/vite` and imported in `src/index.css`.
- **Oxlint** checks React rules and general JavaScript issues.
- **Prettier** handles formatting using the configuration in `.prettierrc.json`.
- **Prettier import sorting** groups React, third-party, and local imports, with blank lines between groups.

Run `pnpm lint` and `pnpm format:check` before submitting changes. From the repository root, use `pnpm format`, `pnpm format:check`, and `pnpm lint` to run both applications.
