# Repair Link development credentials

These credentials are for the local/demo environment only. They are created or refreshed by:

```bash
cd backend
pnpm db:seed
```

| Role | Email | Password | Main workspace |
|---|---|---|---|
| Consumer | `consumer@repairlink.local` | `RepairLink123!` | `/consumer/dashboard` |
| Technician | `technician@repairlink.local` | `RepairLink123!` | `/technician/dashboard` |
| Seller | `seller@repairlink.local` | `RepairLink123!` | `/seller/dashboard` |
| Admin | `admin@repairlink.local` | `RepairLink123!` | `/admin/dashboard` |

Open `http://localhost:5173/auth` and use the email/password above to test real login.

Do not reuse these passwords in production. Production must use a separate secret, secure password-reset flow, and real user-created passwords.
