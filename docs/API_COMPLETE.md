# DoctorBook API — Complete Reference

Base URL: `http://localhost:5000/api`  
Auth header: `Authorization: Bearer <token>`

---

## Auth
| Method | Path | Access |
|--------|------|--------|
| POST | `/auth/register/patient` | Public |
| POST | `/auth/register/doctor` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Auth |

## Specializations
| Method | Path | Access |
|--------|------|--------|
| GET | `/specializations` | Public |

## Admin
| Method | Path |
|--------|------|
| GET | `/admin/stats` |
| GET | `/admin/doctors` `?status=&q=` |
| GET | `/admin/doctors/pending` |
| GET | `/admin/doctors/:id` |
| PATCH | `/admin/doctors/:id/approve` |
| PATCH | `/admin/doctors/:id/reject` `{ reason }` |
| GET | `/admin/patients` |
| GET | `/admin/appointments` |
| PATCH | `/admin/users/:id/deactivate` |
| PATCH | `/admin/users/:id/activate` |

## Doctor
| Method | Path |
|--------|------|
| GET/PUT | `/doctor/profile` |
| POST | `/doctor/profile/photo` |
| GET/POST | `/doctor/documents` |
| DELETE | `/doctor/documents/:id` |
| POST | `/doctor/submit-for-review` |
| GET/POST | `/doctor/slots` |
| DELETE | `/doctor/slots/:id` |
| GET | `/doctor/appointments` |
| POST/GET | `/doctor/prescriptions` |
| POST/GET | `/doctor/reports` |
| GET | `/doctor/patients/:patientUserId/history` |

## Patient
| Method | Path |
|--------|------|
| GET/PUT | `/patient/profile` |
| GET | `/patient/doctors` `?q=&specialization=` |
| GET | `/patient/doctors/:id` |
| GET/POST | `/patient/appointments` |
| GET | `/patient/prescriptions` |
| GET/POST | `/patient/reports` |
| GET | `/patient/medical-history` |

## Appointments (shared)
| Method | Path |
|--------|------|
| POST | `/appointments` (patient book `{ slotId, notes? }`) |
| GET | `/appointments` |
| GET | `/appointments/:id` |
| PATCH | `/appointments/:id/status` `{ status, reason? }` |

Statuses: `booked` | `confirmed` | `completed` | `cancelled` | `no_show`

## Chat
| Method | Path |
|--------|------|
| GET | `/chat/conversations` |
| POST | `/chat/conversations` `{ otherUserId }` |
| GET | `/chat/conversations/:id/messages` |
| POST | `/chat/conversations/:id/messages` JSON or multipart |
| PATCH | `/chat/conversations/:id/read` |

### Socket.IO (`/socket.io`)
Auth: `handshake.auth.token = <jwt>`

Events in: `join_conversation`, `send_message`, `typing`, `stop_typing`, `mark_read`  
Events out: `new_message`, `user_typing`, `user_stop_typing`, `messages_read`, `error`

## Seeded admin
- Email: `admin@doctorbook.local`
- Password: `Admin@12345`
