# DoctorBook Backend

Node.js + Express + Sequelize + PostgreSQL + Socket.IO backend for DoctorBook.

Serves three clients from one API:

| Client | Path | Role |
|--------|------|------|
| Admin Panel | `doctorbook-web` (React) | Admin |
| Doctor App | `doctorbook_app` (Flutter) | Doctor |
| Patient App | `doctorbook_app` (Flutter) | Patient |

Full architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)  
Implementation roadmap: [`docs/API_ROADMAP.md`](docs/API_ROADMAP.md)

This guide is written for beginners. Follow the steps **in order**.

---

## Folder structure

```
backend-doctorbook/
├── config/                # DB, JWT, Multer, Socket config
├── constants/             # Roles, statuses, messages
├── controllers/           # HTTP handlers (auth, admin, doctor, patient, …)
├── services/              # Business logic layer
├── validators/            # express-validator rules
├── middlewares/           # Auth, upload, validate, errors
├── models/                # Sequelize models
├── migrations/            # DB migrations
├── seeders/               # Seed data
├── routes/                # API routes by domain
├── sockets/               # Socket.IO chat handlers
├── uploads/               # profiles, documents, prescriptions, reports, chat
├── utils/                 # JWT, AppError, response helpers
├── docs/                  # Architecture & roadmap
├── Information/           # PostgreSQL setup notes
├── jobs/                  # Background jobs
├── scripts/               # Utility scripts
├── app.js                 # Express app
├── server.js              # HTTP + Socket.IO entry
└── package.json
```

---

## Prerequisites (install once on your machine)

| Tool | Why you need it | Download |
|------|-----------------|----------|
| **Node.js 18+** (LTS) | Runs the backend | https://nodejs.org |
| **PostgreSQL 14+** | Database server | https://www.postgresql.org/download/windows/ |
| **pgAdmin 4** | GUI to manage PostgreSQL | Installed with PostgreSQL installer (or https://www.pgadmin.org) |
| **Git** (optional) | Version control | https://git-scm.com |

During PostgreSQL install on Windows:
1. Remember the password you set for the `postgres` superuser.
2. Keep default port **5432**.
3. Tick **pgAdmin 4** and **Command Line Tools**.

After install, open a **new** PowerShell / CMD and verify:

```bash
node -v
npm -v
psql --version
```

If `psql` is not found, add PostgreSQL `bin` to PATH, for example:
`C:\Program Files\PostgreSQL\16\bin`

---

## Step-by-step setup

### Step 1 — Open the project folder

```bash
cd d:\AKSHAT\doctor\backend-doctorbook
```

### Step 2 — Install Node dependencies

```bash
npm install
```

### Step 3 — Create environment file

If `.env` is missing, copy the example:

```bash
copy .env.example .env
```

Default `.env` values (already match `Information/setup.txt`):

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doctorbook_db
DB_USER=doctorbook_user
DB_PASSWORD=Doctorbook@2026
DB_SCHEMA=doctorbook_schema
```

### Step 4 — Set up PostgreSQL (create user, DB, schema)

You can use **either** pgAdmin **or** `psql`. Both do the same thing.

#### Option A — Using pgAdmin 4 (beginner friendly)

1. Open **pgAdmin 4**.
2. Connect to **PostgreSQL** (enter the `postgres` password).
3. Click **Tools → Query Tool**.
4. Paste and run this SQL (run the whole block):

```sql
CREATE USER doctorbook_user WITH PASSWORD 'Doctorbook@2026';
CREATE DATABASE doctorbook_db OWNER doctorbook_user;
REVOKE CONNECT ON DATABASE doctorbook_db FROM PUBLIC;
GRANT CONNECT ON DATABASE doctorbook_db TO doctorbook_user;
```

5. In the left tree, refresh, then right-click **doctorbook_db → Query Tool**.
6. Paste and run:

```sql
CREATE SCHEMA IF NOT EXISTS doctorbook_schema AUTHORIZATION doctorbook_user;
REVOKE ALL ON SCHEMA doctorbook_schema FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA doctorbook_schema TO doctorbook_user;
ALTER ROLE doctorbook_user SET search_path TO doctorbook_schema, public;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA doctorbook_schema TO doctorbook_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA doctorbook_schema TO doctorbook_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA doctorbook_schema GRANT ALL ON TABLES TO doctorbook_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA doctorbook_schema GRANT ALL ON SEQUENCES TO doctorbook_user;
```

7. In pgAdmin left panel: **Servers → PostgreSQL → Databases → doctorbook_db → Schemas**  
   You should see `doctorbook_schema`.

#### Option B — Using psql (terminal)

```bash
psql -U postgres -h localhost -p 5432
```

Then paste the same SQL from `Information/setup.txt` (Steps 2–8), or:

```sql
CREATE USER doctorbook_user WITH PASSWORD 'Doctorbook@2026';
CREATE DATABASE doctorbook_db OWNER doctorbook_user;
REVOKE CONNECT ON DATABASE doctorbook_db FROM PUBLIC;
GRANT CONNECT ON DATABASE doctorbook_db TO doctorbook_user;

\c doctorbook_db

CREATE SCHEMA IF NOT EXISTS doctorbook_schema AUTHORIZATION doctorbook_user;
REVOKE ALL ON SCHEMA doctorbook_schema FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA doctorbook_schema TO doctorbook_user;
ALTER ROLE doctorbook_user SET search_path TO doctorbook_schema, public;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA doctorbook_schema TO doctorbook_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA doctorbook_schema TO doctorbook_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA doctorbook_schema GRANT ALL ON TABLES TO doctorbook_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA doctorbook_schema GRANT ALL ON SEQUENCES TO doctorbook_user;

\q
```

More detail: see `Information/setup.txt` and `Information/Permissions.txt`.

### Step 5 — Connect pgAdmin as the app user (optional check)

1. Right-click **Servers → Register → Server**.
2. **General** tab → Name: `DoctorBook Local`
3. **Connection** tab:
   - Host: `localhost`
   - Port: `5432`
   - Username: `doctorbook_user`
   - Password: `Doctorbook@2026`
4. Save. You should see `doctorbook_db`.

### Step 6 — Run the server

Development (auto-restart on file changes):

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

You should see:

```
PostgreSQL connected successfully.
DoctorBook API running on port 5000
```

### Step 7 — Test the API

Open a browser or use curl:

```bash
# API welcome
curl http://localhost:5000/

# Health check
curl http://localhost:5000/api/health

# Database health check
curl http://localhost:5000/api/health/db
```

Or open in browser:
- http://localhost:5000/
- http://localhost:5000/api/health
- http://localhost:5000/api/health/db

---

## Useful npm commands

| Command | What it does |
|---------|----------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start with nodemon (development) |
| `npm start` | Start with node (production) |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:migrate:undo` | Undo last migration |
| `npm run db:seed` | Run all seeders |
| `npm run db:seed:undo` | Undo all seeders |
| `npm run db:reset` | Undo all → migrate → seed |

Migrations and seeders will be used once we add real tables/features.

---

## Create a new migration / model (later)

```bash
# Create a blank migration
npx sequelize-cli migration:generate --name create-example-table

# Create a model + migration together
npx sequelize-cli model:generate --name User --attributes name:string,email:string
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `psql` / `password authentication failed` | Use the correct `postgres` password set during install |
| `role "doctorbook_user" already exists` | Skip `CREATE USER` — user already created |
| `database "doctorbook_db" already exists` | Skip `CREATE DATABASE` — already created |
| `Unable to connect to PostgreSQL` | Check PostgreSQL service is running (Windows Services → postgresql) |
| `relation does not exist` | Run migrations: `npm run db:migrate` |
| Port 5000 already in use | Change `PORT` in `.env` |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL is not running or wrong port |

---

## What's next?

**Backend Phases 0–7: COMPLETE**

Architecture → DB → Auth → Doctor approval → Booking → Chat → Prescriptions/Reports → Admin polish.

Full API list: [`docs/API_COMPLETE.md`](docs/API_COMPLETE.md)

Next (optional): build Admin React panel (`doctorbook-web`) and Flutter apps (`doctorbook_app`).
#   b a c k e n d - d o c t o r b o o k  
 