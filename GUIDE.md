# Repair Link — Backend Product Guide

This is the backend specification for Repair Link. Build the product as a trusted local marketplace for electronic repair—not as a generic directory. The frontend contains mock flows only; the backend is the source of truth for identity, ownership, money, repair status, stock, and impact points.

> **Current scope: do not implement authentication yet.** Do not add password hashing, sessions, JWTs, email verification, password recovery, login routes, or production RBAC middleware in this phase. Keep `features/auth/` as an empty reserved module. The existing frontend authentication screens remain UI prototypes only.

For early local development, use a temporary, clearly named development actor (for example, a seeded `platform_users` record selected by a development-only request header). It must be disabled outside local development and replaced by real authentication before any deployed environment. Do not mistake this temporary actor for security.

## Exact Backend Module Architecture

The following folders already exist in `backend/src/`. Their `.gitkeep` files are intentional: they keep the agreed architecture visible in Git until each team member starts implementation. Do not invent a second feature layout elsewhere.

```text
backend/src/
├── config/                     # environment parsing and application config
├── db/                         # Drizzle client and active database schema
├── middleware/                 # auth, role guard, error handler, request logging
├── shared/
│   ├── errors/                 # typed application errors
│   ├── types/                  # cross-feature TypeScript types
│   └── validation/             # shared Zod helpers
└── features/
    ├── auth/                   # sign-up, sessions, verification, password reset
    ├── users/                  # current user account and account settings
    ├── profiles/               # consumer, technician, and seller profiles
    ├── categories/             # device categories, brands, and models
    ├── repair-requests/        # request creation, eligibility, status history
    ├── quotes/                 # technician quotes and consumer comparison
    ├── bookings/               # quote acceptance, appointments, cancellation
    ├── messages/               # repair/order conversations and read state
    ├── notifications/          # in-app notification persistence and delivery jobs
    ├── parts/                  # seller listings, images, compatibility, stock reads
    ├── orders/                 # part checkout, stock reservation, fulfilment
    ├── reviews/                # eligible reviews and rating summaries
    ├── impact/                 # ledger events, balances, badges, point rules
    └── moderation/             # reports, disputes, verification, admin actions
```

Inside a feature, add files only as they become useful, following this exact naming convention:

```text
backend/src/features/repair-requests/
├── repair-requests.routes.ts       # Express route registration
├── repair-requests.service.ts      # permissions and business workflow
├── repair-requests.repository.ts   # non-trivial Drizzle queries
├── repair-requests.schema.ts       # Zod request/response contracts
└── repair-requests.test.ts         # feature tests
```

`backend/app.ts` should eventually compose middleware and feature routers; `backend/server.ts` should only start the HTTP listener. Keep imports one-directional: routes → service → repository/db. A feature may call another feature’s public service, but must not query or mutate that feature’s tables directly.

## Product Roles and Access

A user has one active role: `consumer`, `technician`, `seller`, or `admin`. This is the target authorization model; during the current no-auth phase, use only the temporary local development actor described above. Once auth is enabled, every protected request must authenticate the user and authorize both their role and ownership of the target record.

| Role | Can do | Must never do |
| --- | --- | --- |
| Consumer | Create requests, compare/accept quotes, book, message participants, order parts, review completed repairs | Change a technician’s quote or repair status |
| Technician | Maintain service profile, view eligible leads, quote, update assigned jobs, message participants | View unrelated customer data or accept their own quote |
| Seller | Maintain storefront/listings/stock, fulfil own orders, message order participants | Modify other sellers’ stock or prices |
| Admin | Verify profiles, moderate reports/reviews, resolve disputes, manage categories and impact rules | Bypass the audit trail |

The browser role switcher is prototype-only. Production role assignment must happen server-side, and administrator accounts must never be self-created through public signup.

## Deferred Feature — Accounts, Authentication, and RBAC

**Do not build this feature now.** This section is retained as the future contract so that current modules do not make incompatible decisions.

Support sign-up, sign-in, sign-out, email verification, password reset, role onboarding, and account deactivation. Store a normalized email, a password hash (never a password), verification/reset token hashes with expiry, and session or refresh-token identifiers. Prefer secure HTTP-only cookies or short-lived access tokens with rotated refresh tokens.

On signup, create a `platform_users` record as a consumer, technician, or seller. Technician and seller onboarding should create an incomplete profile; they cannot appear publicly until required profile fields are complete and, where applicable, verified by an admin.

When this feature is later enabled, every service must receive an `actor` (`id`, `role`) from auth middleware. Authorization belongs in backend services, not only routes. Return `401` for missing authentication, `403` for a known user without permission, and avoid leaking whether private resources exist.

## Feature 2 — Profiles and Discovery

### Consumer profile

Allow name, phone, saved locations, contact preference, and impact summary. A consumer can read and update only their own profile.

### Technician profile

Store business name, bio, service area, skills/device categories, years of experience, availability, verification state, response rate, and public rating summary. Public discovery returns only active, complete profiles. Do not calculate ratings from client input; derive them from eligible reviews.

### Seller storefront

Store store name, description, service area, verification status, and rating summary. A seller edits only their own storefront.

Discovery needs filters for category, location/service area, available-today, rating, and mobile service. Start with database filters and pagination; add geospatial search only after locations are modeled precisely. Never expose private phone numbers, email addresses, or exact home addresses in public results.

## Feature 3 — Repair Requests

A consumer creates a repair request with device category, brand/model, issue description, photos, preferred repair method, approximate location, preferred time, and optional budget. Photos should be stored in object storage; the database stores validated metadata and object keys only.

The lifecycle is:

```text
requested → quoted → booked → in_progress → waiting_for_parts → completed
                       ↘ cancelled                     ↘ disputed
```

Only valid transitions are allowed. A consumer creates/cancels a request; the assigned technician updates work statuses after booking; either participant may open a dispute. Every transition writes an immutable `repair_status_history` record containing actor, old/new status, note, and timestamp.

Technicians may view a lead only when it matches their active profile categories/service area. They may quote once per request unless a product decision explicitly permits quote revisions.

## Feature 4 — Quotes, Comparison, and Booking

A quote contains technician ID, amount/currency, message, estimated duration, inclusions/exclusions, expiry, and state. Quotes begin as `sent`; consumers can accept or reject only quotes for their own request.

Accepting a quote must run in one transaction:

1. Confirm the request is still quoteable and the quote is `sent`.
2. Mark the selected quote `accepted`.
3. Mark all competing active quotes `rejected` or `expired`.
4. Create exactly one booking.
5. Move the request to `booked` and write status history.
6. Notify the consumer and technician.

The database should enforce one accepted quote and one booking per repair request. Do not trust quote values submitted by the browser during acceptance.

## Feature 5 — Repair Tracking, Messaging, and Notifications

Repair tracking reads the current repair status plus ordered history. Show the customer what changed, who changed it, and any technician note. Keep internal/admin-only notes separate from customer-visible notes.

Messages belong to a repair request or part order. Before sending or reading a message, confirm both users are participants in that context. Add a conversation identifier if the product needs group/admin conversations later. Support read timestamps, pagination, and idempotent send requests.

Create notifications for new requests, new quotes, accepted/rejected quotes, booking changes, status changes, new messages, part-order events, review reminders, and impact awards. Persist notifications first; email/push delivery is an asynchronous concern.

## Feature 6 — Spare Parts Marketplace

A seller creates listings with name, category, compatible devices, SKU/part number, condition (`new`, `compatible`, `refurbished`, `used`), price, quantity, warranty, images, delivery/collection options, and active state. Listing ownership is mandatory.

Consumers and technicians can search active listings. An order captures the listing, buyer, quantity, and the **unit price at purchase time**. Never recompute historical order totals from the current listing price.

Stock must be changed transactionally. On confirmed order: lock/check available quantity, decrement it, create an inventory movement/order record, then notify seller and buyer. A seller can update stock, but cannot reduce it below reserved/committed units. Start with a single-listing order; introduce multi-item carts only when a single transaction spans all involved sellers safely.

## Feature 7 — Reviews, Trust, Reports, and Disputes

Reviews are allowed only after a completed repair or completed order. Store author, subject, context, rating, body, moderation status, and timestamps. Enforce one review per author per eligible context. Rating summaries are derived server-side, never directly editable.

Reports can target a user, review, listing, repair request, or order. Include reporter, reason, optional evidence, state, resolver, and resolution note. A dispute is a report linked to a repair/order with a dedicated lifecycle. Admin actions must be auditable: record who performed the action, when, and why.

## Feature 8 — Sustainability and Impact Points

Impact points are awarded after a repair is verified completed. Each award is an immutable `impact_events` ledger row with user, repair request, points, reason, rule version, and awarding actor/process. Consumer and technician awards are separate events.

Awarding must be idempotent: retrying a job cannot grant points twice. Add a unique constraint based on repair, recipient, and award type/rule. Point balances are calculated from the ledger or maintained as a transactional projection; never accept a client-provided balance.

Admin-managed rules should define points by device category, repair complexity, reused/refurbished components, and verified recycling. Record the exact rule version used so historical awards remain explainable.

## Feature 9 — Administration

Admin functions include technician/seller verification, category management, review/listing moderation, reports/disputes, impact-rule management, and audit history. Prefer soft deletion or moderation states for user-generated content. Do not hard-delete data needed for a dispute, order, repair, payment, or audit trail.

## Database Plan

`backend/src/db/schema.next.ts` contains the proposed starting model: users, profiles, device categories, repair requests, quotes, bookings, status history, listings, orders, messages, reviews, impact events, and reports. It is a **draft** and is not the active Drizzle schema.

Before generating a migration:

1. Review every table, enum, foreign key, uniqueness rule, and deletion behavior.
2. Merge the agreed model into `backend/src/db/schema.ts`.
3. Update `backend/src/db/index.ts` exports if the schema is modularized.
4. Run `pnpm db:generate`; inspect the generated SQL; commit the schema and migration together.
5. Run `pnpm db:migrate` only against the intended development database.

Use UUID primary keys, `numeric(12,2)` for money, `timestamp with time zone` for timestamps, and server-side enums or constrained text for state. Add indexes for foreign keys and discovery filters before data becomes large.

## API Design and Feature Definition of Done

Use `/api/v1`, Zod request validation, thin route handlers, services for business rules, and repository/database modules for persistence. Place every implementation in the existing module listed in **Exact Backend Module Architecture**. For example, quote acceptance belongs in `quotes/`, booking creation belongs in `bookings/`, and status history belongs in `repair-requests/`; coordinate them through public services and a shared transaction.

An agent may consider a feature complete only when it has:

- Zod validation and safe error responses.
- A temporary development-actor check where ownership is needed; replace it with authenticated authorization when the deferred auth feature starts.
- Explicit state-transition rules where relevant.
- Transaction coverage for multi-record operations.
- Tests for happy path, unauthenticated access, forbidden access, invalid input, and invalid transitions.
- A documented API example and migration if data changed.

Run from `backend/`:

```bash
pnpm typecheck
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

Never edit generated `backend/drizzle/` files, commit `.env`, use `db:push` against shared environments, or rely on frontend role checks or a temporary development actor as security.
