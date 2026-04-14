# TechClinic System — Project Init

> **Purpose**: Comprehensive project reference for AI assistants and developers. Read this first when switching devices or starting a new session.

---

## System Overview

**TechClinic** is a clinic management system for the Technological University of the Philippines (TUP). It handles patient registration, medical records, medicine inventory, analytics, personnel management, and disease outbreak alerts.

### User Flow
```
Student (Public) → Self-Registration (Landing Page) → Record Created (INCOMPLETE)
Nurse → Reviews & Processes Records
Doctor → Adds Diagnosis → Record (COMPLETE)
Database (Supabase PostgreSQL) ← All Data Operations
```

### Roles
- **NURSE**: Register patients, manage records/medicines, view analytics
- **DOCTOR**: Diagnose patients, manage medicines/personnel, view analytics
- **ADMIN**: Full access + personnel management

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Node.js + Express.js | Express v5.1.0 |
| **Frontend** | React + Vite | React v19.2.0, Vite v7.1.14 |
| **Database** | Supabase (PostgreSQL) | supabase-js v2.80.0 |
| **State** | Zustand | v5.0.8 |
| **Styling** | Tailwind CSS | v4.1.17 |
| **Charts** | ApexCharts | v5.3.6 |
| **Auth** | Supabase Auth (email/password + JWT) | |
| **Animations** | Framer Motion | v12.34.3 |

**Ports**: Backend = 3500, Frontend = 5173

---

## Project Structure

```
techlinic-system/
├── Backend/                        # Express.js API Server
│   ├── index.js                    # Entry point (port 3500)
│   ├── .env                        # Environment variables (MUST be saved/populated)
│   ├── config/
│   │   ├── supabaseClient.js       # Supabase client (anon key)
│   │   └── supabaseAdmin.js        # Supabase admin (service role key)
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification + role checking
│   │   └── validate.js             # express-validator rules
│   ├── controllers/
│   │   ├── dataControllers.js      # Patient records, personnel CRUD
│   │   ├── medicineController.js   # Medicine inventory CRUD
│   │   ├── analyticsController.js  # Charts/analytics data
│   │   ├── diseasesController.js   # Disease catalog & outbreak stats
│   │   ├── notificationController.js # Alert notifications
│   │   └── auditTrailController.js # Activity logging
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth/*
│   │   ├── dataRoutes.js           # /api/* (records, patients, personnel)
│   │   ├── medicineRoutes.js       # /api/* (medicine CRUD)
│   │   ├── analyticsRoutes.js      # /api/* (chart data)
│   │   ├── diseasesRoute.js        # /api/* (diseases)
│   │   ├── notificationRoutes.js   # /api/* (notifications)
│   │   ├── auditTrailRoutes.js     # /api/audit-trail
│   │   └── publicRoutes.js         # /api/public/* (no auth)
│   └── docs/
│
├── frontend/techclinic/            # React + Vite App
│   ├── src/
│   │   ├── main.jsx                # React entry
│   │   ├── App.jsx                 # Root (auth init, data loading)
│   │   ├── config/supabaseClient.js
│   │   ├── router/router.jsx       # All routes
│   │   ├── store/                  # Zustand stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useDataStore.js
│   │   │   ├── useMedicineStore.js
│   │   │   ├── useChartStore.js
│   │   │   ├── useNotificationStore.js
│   │   │   ├── usePresenceStore.js
│   │   │   └── useAuditTrailStore.js
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Reusable components
│   │   ├── charts/                 # Chart components
│   │   └── lib/api.js              # Axios instance
│   └── .env                        # Frontend env (VITE_PROJECT_URL, VITE_API_KEY)
│
├── supabase/                       # DB migrations & config
│   ├── config.toml
│   └── migrations/
│
├── docs/                           # Full documentation (17 files + RBAC/)
└── CODEBASE-AUDIT.txt              # Known issues & quality report
```

---

## Environment Variables

### Backend `.env` (REQUIRED)
```bash
NODE_PROJECT_URL=https://<project>.supabase.co
NODE_API_KEY=<supabase-anon-key>
NODE_SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
NODE_SUPABASE_PASSWORD=<db-password>
```

### Frontend `.env`
```bash
VITE_PROJECT_URL=https://<project>.supabase.co
VITE_API_KEY=<supabase-anon-key>
```

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `records` | Patient visit records (vitals, status INCOMPLETE/COMPLETE) |
| `patients` | Unique patient directory (one per student) |
| `diagnoses` | Medical diagnoses (linked to records via record_id) |
| `diseases` | Disease catalog (reference table) |
| `medicines` | Medicine inventory (stock, batch, expiry) |
| `users` | Clinic staff (id matches Supabase Auth, has role) |
| `notifications` | Alert notifications (disease outbreaks, low stock) |
| `audit_trail` | Activity log (who, what, when) |

---

## Key API Endpoints

**Base**: `http://localhost:3500/api`

### Public (no auth)
- `POST /public/register-patient` — Student self-registration
- `GET /public/check-student/:studentId` — Check existing student

### Auth
- `GET /auth/me` — Get user profile
- `GET /auth/role` — Get user role

### Data (authenticated)
- `POST /insert-record` (NURSE) — Create patient record
- `GET /get-records` — All records with diagnoses
- `PUT /insert-diagnosis` (DOCTOR) — Add diagnosis
- `GET /get-patients` — Patient list
- `POST /insert-personnel` (ADMIN) — Create staff
- `PATCH /deactivate-user/:userId` (ADMIN)
- `PATCH /reactivate-user/:userId` (ADMIN)

### Medicine
- `GET /get-medicines` | `POST /insert-medicine` | `PUT /update-medicine` | `DELETE /delete-medicine/:id`

### Analytics (18 endpoints)
- `/get-{weekly|monthly|quarterly|yearly}-patients`
- `/get-{period}-patients-per-department`
- `/get-{period}-top-diagnoses`
- `/get-most-used-medicines`
- `/get-custom-{patients|patients-per-department|top-diagnoses}?dateFrom=&dateTo=`

### Notifications
- `POST /check-alerts` | `GET /all` | `PATCH /read-all` | `DELETE /all`

### Audit Trail
- `GET /audit-trail?entity_type=&actor_role=&limit=`

---

## Auth Flow

```
Login → supabase.auth.signInWithPassword() → JWT + session
     → Query users table for profile + role
     → Zustand persist to localStorage
     → Backend: authenticate middleware verifies JWT on each request
     → Backend: authorize middleware checks role
```

---

## Frontend Routes

| Route | Access | Page |
|-------|--------|------|
| `/` | Public | LandingPage (student registration) |
| `/login` | Public | Login |
| `/dashboard` | All roles | newDashboard |
| `/patient-record` | All roles | PatientRecord |
| `/individual-record/:studentId` | All roles | IndividualRecord |
| `/medicine-inventory` | All roles | newMedicine |
| `/new-patient` | DOCTOR, NURSE | NewPatient |
| `/add-medicine` | DOCTOR, NURSE | AddMedicine |
| `/add-diagnosis/:recordId` | DOCTOR | AddDiagnosis |
| `/personnel-list` | ADMIN | PersonnelList |
| `/notifications` | All roles | Notifications |
| `/activity-log` | All roles | ActivityLog |
| `/settings` | All roles | Settings |

---

## Zustand Stores

| Store | Key | Purpose |
|-------|-----|---------|
| `useAuthStore` | auth-storage | User auth + profile (persisted) |
| `useDataStore` | data-storage | Records + patients + personnel (5min cache) |
| `useMedicineStore` | medicine-storage | Medicine inventory (5min cache) |
| `useChartStore` | — | Analytics chart data |
| `useNotificationStore` | — | Notifications (30s polling) |
| `usePresenceStore` | — | User activity tracking |
| `useAuditTrailStore` | — | Audit log viewing |

---

## Known Issues (from CODEBASE-AUDIT.txt)

### Critical
- **Variable mismatch**: `dataControllers.js ~Line 157` references undefined `patientsInformationError`
- **Missing returns** after `res.json()` in several controllers → "headers already sent" errors
- **ProtectedRoute not applied** — frontend routes unguarded
- **Race condition** on medicine stock updates (read-modify-write, not atomic)

### Security
- CORS open (`origin: true`) — should restrict in production
- Debug console.logs in controllers (e.g., `console.log('gumagana ako diseases')`)
- No role enforcement on some data endpoints

### Performance
- Hardcoded department list duplicated 4x in analyticsController
- `getMostUsedMedicines` fetches entire table into memory
- moment.js (70KB) used only in analytics — consider day.js

### Naming Typos
- `getMonthyPatients` → `getMonthlyPatients`
- `getRecordsFromExisitingPatients` → `getRecordsFromExistingPatients`
- Response: `"erorr"` → `"error"`

### Unused Code
- Pages: Dashboard.jsx, Analytics.jsx, MedicineInventory.jsx (old versions)
- Components: Navigation.jsx (old), FormatDate.js
- NPM: @tanstack/react-table, class-variance-authority (never imported)
- Functions: `fetchUserSignature()`, `insertDiagnose()` (incomplete)

---

## Quick Start

```bash
# Backend
cd Backend
npm install
# Ensure .env is populated and SAVED
npm run dev          # nodemon on port 3500

# Frontend
cd frontend/techclinic
npm install
npm run dev          # Vite on port 5173
```

---

## Remote
- **GitHub**: https://github.com/KarlBautista/techlinic-system
- **Branch**: main
