# CRM-admin backend

Node.js + Express + MongoDB (Mongoose) backend.

## Setup

1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies: `npm install`
3. Run in dev mode: `npm run dev`
4. (Optional) Seed a default admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`: `npm run seed:admin`

## Endpoints

- `GET /health` — health check
- `POST /api/auth/login` — { email, password }
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`
- `POST /api/auth/forgot-password` — { email }, sends a reset link if the account exists
- `POST /api/auth/reset-password` — { token, password }
