# DoctorBook Backend Architecture

Shared API for:

| Client | Tech | Role |
|--------|------|------|
| `doctorbook-web` | React.js | Admin panel |
| `doctorbook_app` | Flutter | Doctor + Patient apps (role-based) |

Stack: **Node.js · Express · Sequelize · PostgreSQL · JWT · Socket.IO · Multer**

---

## 1. High-level architecture

```
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Admin Web      │  │  Doctor (Flutter)│  │  Patient (Flutter)│
│  React + Vite   │  │  role = doctor   │  │  role = patient   │
└────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘
         │ REST/JWT           │ REST/JWT + WS       │ REST/JWT + WS
         └────────────────────┼─────────────────────┘
                              ▼
                 ┌────────────────────────┐
                 │   Express API (:5000)  │
                 │   /api/*               │
                 │   Socket.IO /socket.io │
                 └───────────┬────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        PostgreSQL      Local uploads    Background jobs
     doctorbook_schema   /uploads/*       (slots, reminders)
```

---

## 2. Folder structure

```
backend-doctorbook/
├── config/                 # Env-driven config (DB, JWT, multer, socket)
├── constants/              # Roles, statuses, HTTP codes, messages
├── controllers/            # HTTP handlers (thin — call services)
│   ├── auth/
│   ├── admin/
│   ├── doctor/
│   ├── patient/
│   ├── appointment/
│   ├── chat/
│   └── document/
├── services/               # Business logic (reusable across roles)
├── validators/             # Request validation (express-validator)
├── middlewares/            # Auth, roles, upload, validate, errors
├── models/                 # Sequelize models
├── migrations/             # Schema versioning
├── seeders/                # Seed admin, specializations, demo data
├── routes/                 # Route mounts per domain
├── sockets/                # Socket.IO chat handlers
├── uploads/                # Secure local file storage
│   ├── profiles/
│   ├── documents/
│   ├── prescriptions/
│   ├── reports/
│   └── chat/
├── utils/                  # Response helpers, JWT, AppError, etc.
├── jobs/                   # Scheduled tasks
├── scripts/                # One-off utilities (DB check, etc.)
├── docs/                   # Architecture & API notes
├── app.js                  # Express app
└── server.js               # HTTP + Socket.IO bootstrap
```

**Layering rule:** `Route → Middleware → Controller → Service → Model`

---

## 3. Domain modules

| Module | Responsibility |
|--------|----------------|
| **Auth** | Register/login for admin, doctor, patient; JWT issue/refresh; password hash |
| **Admin** | Approve/reject doctors; list users/doctors/appointments; platform stats |
| **Doctor** | Profile, documents, availability slots, appointments, prescriptions |
| **Patient** | Profile, browse approved doctors, book slots, medical history |
| **Appointment** | Book / cancel / complete; status transitions |
| **Chat** | Conversations, messages, Socket.IO real-time delivery |
| **Document** | Upload/serve profiles, verification docs, reports, prescriptions |

---

## 4. Database schema (planned tables)

All tables live in schema `doctorbook_schema`.

### Core identity

| Table | Purpose |
|-------|---------|
| `users` | Shared login: email, phone, password_hash, role (`admin`\|`doctor`\|`patient`), is_active |
| `doctor_profiles` | Professional details + `approval_status` (`pending`\|`approved`\|`rejected`) |
| `doctor_documents` | Verification uploads linked to doctor |
| `patient_profiles` | Patient demographics / medical summary |
| `specializations` | Master list (Cardiology, Dermatology, …) |

### Scheduling

| Table | Purpose |
|-------|---------|
| `availability_slots` | Doctor-defined open slots (date/time, duration, is_booked) |
| `appointments` | Patient booking against a slot; status lifecycle |

### Chat & clinical files

| Table | Purpose |
|-------|---------|
| `conversations` | One doctor ↔ one patient thread |
| `messages` | Text / image / file / prescription message types |
| `prescriptions` | Structured Rx metadata + file path; linked to patient & appointment |
| `medical_reports` | Patient/doctor uploaded reports & images |

### Key workflow fields

- Doctor **not visible** to patients until `doctor_profiles.approval_status = 'approved'`
- Slot booking marks `availability_slots.is_booked = true` and creates `appointments` row
- Prescription upload creates `prescriptions` row **and** a chat `messages` row of type `prescription`

### Entity relationships (simplified)

```
users 1──1 doctor_profiles 1──* doctor_documents
users 1──1 patient_profiles
doctor_profiles *──1 specializations
doctor_profiles 1──* availability_slots
users(patient) + users(doctor) + slot → appointments
users(doctor) + users(patient) → conversations 1──* messages
appointments / users → prescriptions, medical_reports
```

---

## 5. API surface (v1)

Base URL: `http://localhost:5000/api`

### Auth — `/api/auth`
| Method | Path | Who | Description |
|--------|------|-----|-------------|
| POST | `/register/patient` | Public | Patient signup |
| POST | `/register/doctor` | Public | Doctor signup + profile draft |
| POST | `/login` | Public | Login (all roles) → JWT |
| GET | `/me` | Auth | Current user profile |
| POST | `/logout` | Auth | Client-side token discard (optional blacklist later) |

### Admin — `/api/admin` (role: admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/doctors` | All doctors |
| GET | `/doctors/pending` | Registration requests |
| GET | `/doctors/:id` | Doctor + documents |
| PATCH | `/doctors/:id/approve` | Approve → visible to patients |
| PATCH | `/doctors/:id/reject` | Reject with reason |
| GET | `/patients` | Registered patients |
| GET | `/appointments` | Platform appointments |
| GET | `/stats` | Dashboard counts |

### Doctor — `/api/doctor` (role: doctor)
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/profile` | View / update professional profile |
| POST | `/documents` | Upload verification docs |
| POST | `/submit-for-review` | Mark profile ready for admin |
| GET/POST | `/slots` | List / create availability |
| DELETE | `/slots/:id` | Remove open slot |
| GET | `/appointments` | Upcoming / past |
| POST | `/prescriptions` | Upload Rx for a patient/appointment |

### Patient — `/api/patient` (role: patient)
| Method | Path | Description |
|--------|------|-------------|
| GET/PUT | `/profile` | Patient profile |
| GET | `/doctors` | **Approved only** (+ search name/specialization) |
| GET | `/doctors/:id` | Public doctor detail + slots |
| POST | `/appointments` | Book a slot |
| GET | `/appointments` | History |
| GET | `/prescriptions` | Received prescriptions |
| GET | `/reports` | Medical history / reports |

### Appointments — `/api/appointments` (doctor | patient | admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:id` | Detail |
| PATCH | `/:id/status` | cancel / complete / no_show |

### Chat — `/api/chat` (doctor | patient)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/conversations` | My threads |
| POST | `/conversations` | Start / get thread with other user |
| GET | `/conversations/:id/messages` | History (paginated) |
| POST | `/conversations/:id/messages` | Send text (REST fallback) |

### Documents / uploads — `/api/documents`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/upload` | Multipart upload (typed category) |
| GET | `/:id` | Metadata / authorized download |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Liveness |
| GET | `/api/health/db` | DB ping |

---

## 6. Real-time chat (Socket.IO)

- Namespace: default `/` (or `/chat`)
- Auth: JWT in `handshake.auth.token`
- Events:
  - `join_conversation` → room `conversation:{id}`
  - `send_message` → persist + emit `new_message` to room
  - `typing` / `stop_typing`
  - `message_read`
- Message types: `text` | `image` | `file` | `prescription` | `report`
- Prescriptions uploaded via REST also emit `new_message` so the patient app updates live

---

## 7. Auth & security

- Passwords: `bcryptjs`
- Access: JWT (`Authorization: Bearer <token>`) with `id`, `role`, `email`
- Middleware: `authenticate` → `authorize('admin'|'doctor'|'patient')`
- Uploads: Multer disk storage under `/uploads/{category}`; validate MIME + size
- Serve files via `/uploads/...` with auth-gated download endpoints for sensitive docs
- Helmet + CORS + rate limiting (to be enabled per phase)

---

## 8. Doctor approval workflow

```
Doctor registers → approval_status = pending
       ↓
Uploads docs + submits for review
       ↓
Admin reviews in web panel
       ├── reject → status = rejected (not listed)
       └── approve → status = approved
                         ↓
              Visible in patient doctor search
```

---

## 9. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **0** | Architecture scaffold (this phase) |
| **1** | DB migrations + models + admin seeder |
| **2** | Auth (register/login JWT) for all roles |
| **3** | Doctor registration + documents + admin approve/reject |
| **4** | Patient browse approved doctors + slots + booking |
| **5** | Chat (REST history + Socket.IO) |
| **6** | Prescriptions, reports, medical history |
| **7** | Admin dashboard stats + polish |

Next step after architecture: **Phase 1 — database models & migrations**.
