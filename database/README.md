# Database Setup

Two files, run in order:

1. **`software_agency_db.sql`** — your original schema + data dump (admins, services,
   projects, team_members, inquiries). Import this first into a fresh database.
2. **`migration_admin_portal_upgrade.sql`** — additive upgrade that adds the columns
   and tables the full admin portal needs. It is **idempotent** (safe to run more
   than once) and **never deletes data**. It also remaps existing inquiry statuses
   into the new pipeline (`in_progress→in_review`, `completed→converted`,
   `rejected→archived`) so no historical data is lost.

```bash
mysql -u root -p -e "CREATE DATABASE software_agency_db;"
mysql -u root -p software_agency_db < software_agency_db.sql
mysql -u root -p software_agency_db < migration_admin_portal_upgrade.sql
```

## What the migration adds

| Table | New columns |
|---|---|
| `team_members` | `skills` (comma-separated tags), `github` |
| `services` | `category`, `technologies`, `features`, `delivery_time`, `icon` |
| `projects` | `category`, `live_demo_url`, `github_url`, `challenge`, `solution`, `impact_metrics` |
| `inquiries` | `budget`, `timeline`, expanded `status` enum |

**New table:** `project_team_assignments` — many-to-many join table between
`projects` and `team_members`, with `ON DELETE CASCADE` on both foreign keys so
deleting a project or a team member automatically cleans up assignments without
manual cleanup or FK errors.

## Default admin login

The imported dump ships with one admin account:

- **Email:** `admin@example.com`
- **Password:** whatever you originally set for the `password_hash` in your dump —
  this project does not know it. If you don't know it, generate a new bcrypt hash
  and update it directly:

```bash
node -e "require('bcrypt').hash('YourNewPassword123', 12).then(console.log)"
```

```sql
UPDATE admins SET password_hash = '<paste hash here>' WHERE email = 'admin@example.com';
```
