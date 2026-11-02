# Phase 3 — Doctor documents & admin approval

## Doctor APIs (`/api/doctor`) — Bearer doctor token

| Method | Path | Description |
|--------|------|-------------|
| GET | `/profile` | Full doctor profile + documents |
| PUT | `/profile` | Update professional details |
| POST | `/profile/photo` | Upload profile photo (`multipart` field `file`) |
| GET | `/documents` | List verification documents |
| POST | `/documents` | Upload doc (`file` + `documentType`) |
| DELETE | `/documents/:id` | Remove a document |
| POST | `/submit-for-review` | Send application to admin |

### Document types
`license` | `degree` | `id_proof` | `registration` | `other`

### Submit requirements
Must have: specialization, medicalRegistrationNumber, qualifications, yearsOfExperience, consultationFee, and **at least one document**.

## Admin APIs (`/api/admin`) — Bearer admin token

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Dashboard counts |
| GET | `/doctors` | All doctors (`?status=&q=`) |
| GET | `/doctors/pending` | Pending applications |
| GET | `/doctors/:id` | Doctor + documents |
| PATCH | `/doctors/:id/approve` | Approve → visible to patients |
| PATCH | `/doctors/:id/reject` | Body: `{ "reason": "..." }` |
| GET | `/patients` | Registered patients (`?q=`) |

## Patient visibility (`/api/patient/doctors`)
Only doctors with `approvalStatus = approved` and active user accounts are listed.

## Workflow
1. Doctor registers (pending)
2. Completes profile + uploads documents
3. Submits for review
4. Admin approves or rejects
5. If approved → appears in patient doctor list
