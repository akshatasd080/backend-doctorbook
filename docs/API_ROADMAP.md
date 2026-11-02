# DoctorBook API Roadmap

## Phase 0 — Architecture
- [x] Folder structure & layering
- [x] Config (DB, JWT, Multer, Socket)
- [x] Route mounts for all modules
- [x] Socket.IO bootstrap + auth handshake
- [x] Upload category folders

## Phase 1 — Database
- [x] All core models + migrations
- [x] Admin + specialization seeders

## Phase 2 — Authentication
- [x] Patient / doctor register
- [x] Login for all roles + `GET /auth/me`
- [x] JWT middleware

## Phase 3 — Doctor approval
- [x] Profile + document upload
- [x] Submit for review
- [x] Admin approve / reject
- [x] Approved-only patient visibility

## Phase 4 — Booking
- [x] Doctor slot management
- [x] Patient browse/search doctors
- [x] Book / cancel / status / list appointments

## Phase 5 — Chat
- [x] Conversation create/list
- [x] Message history (REST)
- [x] Real-time send via Socket.IO
- [x] Image/file share in chat

## Phase 6 — Clinical documents
- [x] Prescription upload → patient inbox + chat message
- [x] Medical reports upload/list
- [x] Medical history view

## Phase 7 — Admin polish
- [x] Stats dashboard
- [x] Manage patients/doctors/appointments lists
- [x] Activate / deactivate accounts

**Backend feature roadmap: COMPLETE**

See `API_COMPLETE.md` for the full endpoint list.
