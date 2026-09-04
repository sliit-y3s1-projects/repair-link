# Repair Link Backend Build Guide

## Purpose and Current State

This repository has a frontend-only product prototype. The backend is a TypeScript, Express, PostgreSQL/Neon, and Drizzle ORM foundation. Build real authorization on the server; the frontend RBAC is only a UX prototype and must never determine access.

## Read This First

Start with [README.md](README.md), `backend/src/db/schema.ts`, and `backend/src/db/schema.next.ts`. The current `schema.ts` is the active example schema. `schema.next.ts` is the reviewed domain blueprint for the product; it is deliberately excluded from Drizzle configuration so nobody can accidentally migrate it. Reconcile the two before replacing the active schema and generating the first real migration.

Use UUIDs consistently for all new production entities. Store money as `numeric`, timestamps with time zones, and enum-like lifecycle fields as PostgreSQL enums. Never put secrets, passwords, reset tokens, or raw payment data in the database.

## Backend Feature Ownership

Implement features in this order. Each feature should own its route, service, validation, and tests under `backend/src/features/<feature>/`.

1. **Auth and RBAC** — users, password hashing, sessions/tokens, email verification, recovery, and middleware requiring `consumer`, `technician`, `seller`, or `admin` roles.
2. **Profiles** — consumer preferences; technician services, availability, verification; seller storefronts.
3. **Repair marketplace** — device categories, requests, uploads, quote comparison, quote acceptance, bookings, and status history.
4. **Messaging and notifications** — conversations must verify that the sender belongs to the repair or order context.
5. **Parts marketplace** — listings, stock transactions, orders, and seller-only inventory mutations.
6. **Trust and impact** — reviews only after completion; idempotent impact events; reports and admin resolution.

## API and Authorization Rules

Use `/api/v1` routes and Zod to validate all request input. Keep handlers thin; services enforce business rules and transactions. Examples:

```text
POST /api/v1/repair-requests          consumer
POST /api/v1/repair-requests/:id/quotes technician
POST /api/v1/quotes/:id/accept         owning consumer
PATCH /api/v1/repair-requests/:id/status assigned technician
POST /api/v1/parts                     seller
PATCH /api/v1/admin/reports/:id         admin
```

Always load the resource and verify ownership or role before mutation. Quote acceptance, booking creation, status changes, stock deduction, and impact awarding must run in a database transaction. Use explicit state-transition checks: for example, only an accepted quote can create a booking, and only a completed repair can create a review or impact event.

## Database Workflow

From `backend/`:

```bash
pnpm typecheck
pnpm db:generate  # after approved schema changes
pnpm db:migrate   # apply committed migrations
pnpm db:studio    # inspect local/development data
```

Do not edit generated files in `backend/drizzle/`. Do not use `db:push` against shared, staging, or production databases. Commit every generated migration with the schema change that produced it.

## Agent Checklist

Before coding: identify the role, resource owner, allowed state transitions, and failure cases. Before finishing: add validation, authorization tests, a migration when needed, and an API example. Keep mock frontend data isolated; replace it only after the API contract is stable.
