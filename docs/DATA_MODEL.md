# DoctorBook Data Model (Phase 1 — implemented)

Schema: `doctorbook_schema`

## users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID / BIGINT PK | |
| full_name | STRING | |
| email | STRING UNIQUE | |
| phone | STRING UNIQUE | |
| password_hash | STRING | |
| role | ENUM admin\|doctor\|patient | |
| profile_photo | STRING nullable | relative path under uploads/profiles |
| is_active | BOOLEAN default true | |
| created_at / updated_at | TIMESTAMP | |

## specializations
| Column | Type |
|--------|------|
| id | PK |
| name | STRING UNIQUE |
| description | TEXT nullable |

## doctor_profiles
| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| user_id | FK → users | unique |
| specialization_id | FK → specializations | nullable until set |
| qualifications | TEXT | degrees / certifications |
| medical_registration_number | STRING | |
| years_of_experience | INTEGER | |
| hospital_clinic_name | STRING | |
| hospital_clinic_address | TEXT | |
| consultation_fee | DECIMAL | |
| bio | TEXT | |
| approval_status | ENUM pending\|approved\|rejected | default pending |
| rejection_reason | TEXT nullable | |
| submitted_at | TIMESTAMP nullable | |
| reviewed_at | TIMESTAMP nullable | |
| reviewed_by | FK → users (admin) nullable | |

## doctor_documents
| Column | Type |
|--------|------|
| id | PK |
| doctor_profile_id | FK |
| document_type | STRING (license, degree, id_proof, other) |
| file_path | STRING |
| original_name | STRING |
| mime_type | STRING |

## patient_profiles
| Column | Type |
|--------|------|
| id | PK |
| user_id | FK → users | unique |
| date_of_birth | DATE nullable |
| gender | STRING nullable |
| blood_group | STRING nullable |
| address | TEXT nullable |
| emergency_contact | STRING nullable |
| medical_history_summary | TEXT nullable |

## availability_slots
| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| doctor_profile_id | FK | |
| start_time | TIMESTAMPTZ | |
| end_time | TIMESTAMPTZ | |
| is_booked | BOOLEAN default false | |
| is_active | BOOLEAN default true | |

## appointments
| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| patient_user_id | FK → users | |
| doctor_profile_id | FK | |
| slot_id | FK → availability_slots | |
| status | ENUM booked\|confirmed\|completed\|cancelled\|no_show | |
| notes | TEXT nullable | |
| cancelled_by | STRING nullable | |
| cancel_reason | TEXT nullable | |

## conversations
| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| doctor_user_id | FK → users | |
| patient_user_id | FK → users | |
| last_message_at | TIMESTAMPTZ nullable | |
| Unique(doctor_user_id, patient_user_id) | | one thread per pair |

## messages
| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| conversation_id | FK | |
| sender_id | FK → users | |
| message_type | ENUM text\|image\|file\|prescription\|report | |
| content | TEXT nullable | |
| file_path | STRING nullable | |
| prescription_id | FK nullable | |
| medical_report_id | FK nullable | |
| is_read | BOOLEAN default false | |

## prescriptions
| Column | Type |
|--------|------|
| id | PK |
| doctor_user_id | FK |
| patient_user_id | FK |
| appointment_id | FK nullable |
| title | STRING |
| notes | TEXT nullable |
| file_path | STRING |
| prescribed_at | TIMESTAMPTZ |

## medical_reports
| Column | Type |
|--------|------|
| id | PK |
| uploaded_by | FK → users |
| patient_user_id | FK → users |
| appointment_id | FK nullable |
| title | STRING |
| report_type | STRING |
| file_path | STRING |
| notes | TEXT nullable |

---

Visibility rule: patient doctor listings filter  
`doctor_profiles.approval_status = 'approved'` AND `users.is_active = true`.
