# Hikmat Tech Solutions — Backend

Express + MySQL API powering both the public website and the admin portal.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your real values
```

`.env` keys:

| Key | Example |
|---|---|
| `PORT` | `4000` |
| `FRONTEND_URL` | `http://localhost:5173` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | your MySQL connection |
| `JWT_SECRET` | a random string, 32+ characters |

Import the database — see `../database/README.md` for the two-step import
(base schema + admin portal migration).

## Run

```bash
npm run dev     # nodemon, auto-restarts on change
npm start        # production
```

## API surface

**Public (no auth):**
- `GET /api/health`
- `GET /api/services`, `GET /api/services/:id`
- `GET /api/projects`, `GET /api/projects/:id`
- `GET /api/team-members`, `GET /api/team-members?active=1`
- `POST /api/inquiries` (contact form submission)

**Auth:**
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`

**Admin (all require a valid session cookie set by `/api/auth/login`):**
- `GET /api/admin/dashboard`, `GET /api/admin/stats`
- `PUT /api/admin/password`, `PUT /api/admin/profile`
- Full CRUD on `/api/services`, `/api/projects`, `/api/team-members` (POST/PUT/DELETE)
- `PATCH /api/team-members/:id/status` (activate/deactivate)
- `GET /api/inquiries`, `PATCH /api/inquiries/:id/status`, `DELETE /api/inquiries/:id`

Auth uses an httpOnly `admin_token` cookie (JWT, 8h expiry) set on login — this is
the existing convention from earlier in the project, kept as-is rather than
introducing a separate `/api/admin/login` route, to avoid disrupting the working
auth flow.

## Uploads

Images (team photos, service images, project covers) are saved to
`backend/uploads/{team,services,projects}/` and served statically at
`/uploads/{team,services,projects}/...`. Accepted: JPG, PNG, WEBP, max 5MB —
validated both by MIME type and by inspecting the file's magic bytes.
