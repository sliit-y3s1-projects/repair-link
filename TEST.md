# Repair Link MVP test runbook

This file is the end-to-end smoke test for the four MVP areas. It does not expose or require the Neon database password.

## Start the applications

Terminal 1:

```bash
cd backend
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Terminal 2:

```bash
cd frontend
pnpm dev
```

Open `http://localhost:5173/auth`. For this prototype, click **Open consumer**, **Open technician**, **Open seller**, or **Open admin**. The API base is `http://localhost:5000` (set `VITE_BACKEND_URL` in `frontend/.env` if different).

## Demo login credentials

Run `pnpm db:seed` after migrating. Every seeded account has this development-only password:

```text
RepairLink123!
```

| Role | Demo email | Actor ID |
|---|---|---|
| Consumer | consumer@repairlink.local | 00000000-0000-4000-8000-000000000001 |
| Technician | technician@repairlink.local | 00000000-0000-4000-8000-000000000002 |
| Seller | seller@repairlink.local | 00000000-0000-4000-8000-000000000003 |
| Admin | admin@repairlink.local | 00000000-0000-4000-8000-000000000004 |

Login and registration now return a signed access token. The older development headers are retained only for the role-preview buttons while developing. Example authenticated API call:

```bash
BASE=http://localhost:5000/api/v1
TOKEN=PASTE_TOKEN_RETURNED_BY_LOGIN
curl -H "Authorization: Bearer $TOKEN" "$BASE/categories"
```

## Feature 1 — Repair requests, quotes, and booking

1. Open the consumer dashboard and create a repair request from **New repair request**.
2. Confirm it appears under `/consumer/repairs`.
3. Open the technician dashboard (`/technician/leads`), enter an amount, and click **Send quote**.
4. Return to the consumer repair detail page and click **Accept quote**.
5. Confirm the request changes to **Booked**.
6. Open technician jobs (`/technician/jobs`) and move the job through `in_progress` and `completed`.
7. Confirm the status history and dashboard counters update.

API smoke calls (IDs are returned by the previous call):

```bash
# consumer creates
curl -X POST "$BASE/repair-requests" -H 'Content-Type: application/json' \
  -H 'x-dev-actor-id: 00000000-0000-4000-8000-000000000001' -H 'x-dev-actor-name: Nimal Fernando' -H 'x-dev-actor-role: consumer' \
  -d '{"categoryId":"00000000-0000-4000-8000-000000000010","deviceBrand":"Apple","deviceModel":"iPhone 13","issueDescription":"The screen is cracked and touch is unreliable.","preferredMethod":"shop_visit","locationText":"Colombo 03","budgetAmount":8000}'

# technician quotes (replace REQUEST_ID)
curl -X POST "$BASE/repair-requests/REQUEST_ID/quotes" -H 'Content-Type: application/json' \
  -H 'x-dev-actor-id: 00000000-0000-4000-8000-000000000002' -H 'x-dev-actor-name: Kamal Device Care' -H 'x-dev-actor-role: technician' \
  -d '{"amount":6500,"message":"Same-day repair","estimatedDurationHours":3}'
```

## Feature 2 — Technician profiles and service discovery

1. Open `/technician/profile` and save service area/services.
2. Confirm the save survives a page refresh.
3. Open `/repairers` as a visitor and confirm verified technician profiles are listed.
4. Admin opens `/admin/management`, verifies or rejects a technician, then refreshes discovery to confirm visibility changes.

Relevant API CRUD: `GET/POST/PATCH/DELETE /api/v1/technician-profiles` and `PATCH /api/v1/admin/technicians/:id/verification`.

## Feature 3 — Seller listings, purchasing, and fulfilment

1. Open `/seller/storefront` and create a listing.
2. Edit its stock or price, toggle active/inactive, then delete/archive it.
3. Open `/parts` as the consumer and purchase an active listing.
4. Open `/seller/orders`, move the order through **Packed**, **Shipped**, and **Delivered**.
5. Confirm stock decreases and the order appears in buyer history.

Relevant API CRUD: `GET/POST/PATCH/DELETE /api/v1/parts`, `POST/GET /api/v1/orders`, and `PATCH /api/v1/orders/:orderId/status`.

## Feature 4 — Admin, moderation, and trust controls

1. Sign in with **Open admin** and open `/admin/dashboard`.
2. Click **Open management** or **Manage catalog** in the sidebar. This is `/admin/management`.
3. In **Device categories**, create a category, rename it, activate/deactivate it, and delete it.
4. In **Verification**, verify the seeded technician.
5. In **Reports**, resolve an open report. Admin-only access is enforced by the API.
6. In **Disputed repairs**, mark a disputed repair resolved.

Admin API CRUD: `GET/POST/PATCH/DELETE /api/v1/categories`, `GET/PATCH /api/v1/admin/reports`, and verification endpoints for technicians/sellers.

## Validation commands

```bash
cd frontend && pnpm lint && pnpm build
cd ../backend && pnpm typecheck
```

Expected result: all commands exit successfully. The frontend build may print LightningCSS warnings for Tailwind `@theme`/`@utility` rules; these are warnings and do not fail the build.

## Important development limitation

Registration, login, password hashing, and signed bearer-token authentication are now implemented. Password-reset email delivery is not implemented yet. Before deployment, set a strong `AUTH_TOKEN_SECRET`, remove development-header role preview, add token revocation/refresh handling, and rotate any database credentials that were ever shared in shell history or chat.
