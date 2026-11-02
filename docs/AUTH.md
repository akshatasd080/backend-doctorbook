# Auth API (Phase 2)

Base: `http://localhost:5000/api/auth`

All successful responses:

```json
{ "success": true, "message": "...", "data": { } }
```

## Endpoints

### POST `/register/patient`
Creates `users` (role=patient) + `patient_profiles`. Returns JWT.

```json
{
  "fullName": "Test Patient",
  "email": "patient1@test.com",
  "phone": "9000000001",
  "password": "Patient@123",
  "gender": "female",
  "bloodGroup": "B+"
}
```

Optional: `dateOfBirth`, `address`, `emergencyContact`, `medicalHistorySummary`, `profilePhoto`

### POST `/register/doctor`
Creates `users` (role=doctor) + `doctor_profiles` with `approvalStatus: "pending"`. Returns JWT.

```json
{
  "fullName": "Dr Test Doctor",
  "email": "doctor1@test.com",
  "phone": "9000000002",
  "password": "Doctor@123",
  "specialization": "Cardiologist",
  "qualifications": "MBBS, MD",
  "medicalRegistrationNumber": "MCI-12345",
  "yearsOfExperience": 8,
  "hospitalClinicName": "City Heart Clinic",
  "consultationFee": 500
}
```

Use either `specialization` (name) or `specializationId` (number from seed list).

Doctor is **not** publicly visible until admin approval (Phase 3).

### POST `/login`
Works for admin, doctor, and patient.

```json
{ "email": "admin@doctorbook.local", "password": "Admin@12345" }
```

Response `data`:

```json
{
  "token": "<jwt>",
  "user": { "id": 1, "role": "admin", "...": "..." }
}
```

### GET `/me`
Header: `Authorization: Bearer <token>`

Returns the current user + role profile (`doctorProfile` / `patientProfile`).

## Seeded admin

| Field | Value |
|-------|--------|
| Email | `admin@doctorbook.local` |
| Password | `Admin@12345` |

## JWT

- Payload: `{ id, role, email }`
- Header: `Authorization: Bearer <token>`
- Expiry: `JWT_EXPIRES_IN` (default `7d`)
