# LifeLink Frontend

LifeLink is a role-based blood donation and emergency blood-request platform for donors, hospitals, blood banks, and administrators. This repository contains the React single-page application.

## Features

- donor registration, profile management, availability, and appointment scheduling;
- hospital blood-request creation, tracking, inventory viewing, and donor search;
- blood-bank inventory, request-match, fulfillment, and appointment workflows;
- administrator metrics and organization verification;
- JWT authentication with automatic access-token refresh;
- protected routes based on role and organization verification status.

## Technology

- React 19 and TypeScript
- Vite 8
- React Router
- Axios
- Lucide React

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- a running [LifeLink backend](https://github.com/krishnaharki363/backend-lifelink)

## Local setup

```bash
git clone git@github.com:krishnaharki363/Lifelink-frontend.git
cd Lifelink-frontend
npm install
cp .env.example .env.local
npm run dev
```

The application is served at `http://localhost:5173` by default.

Set the backend URL in `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Do not commit `.env.local`; environment files are ignored except for the safe `.env.example` template.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run Oxlint |
| `npm run preview` | Preview the production build locally |

## Application routes

| Route | Access |
| --- | --- |
| `/` | Public landing page |
| `/login` | Sign in or create an organization account |
| `/register` | Donor registration |
| `/pending-verification` | Signed-in organizations awaiting approval |
| `/donor` | Donor only |
| `/hospital` | Approved hospital only |
| `/blood-bank` | Approved blood bank only |
| `/admin` | Administrator only |

## Authentication

The Axios client attaches the access token to protected API calls. When a request returns `401`, it calls `/auth/refresh` once using the HTTP-only refresh-token cookie, stores the new access token, and retries the original request. If refresh fails, local authentication state is cleared and the user is returned to `/login`.

## Deployment

`vercel.json` configures the production build and SPA route fallback. In Vercel, set `VITE_API_URL` to the deployed backend `/api/v1` URL.

Pull requests and pushes to `main` run lint and production-build checks through GitHub Actions.
