# 6. Frontend Architecture

## Routing

All routes are defined in `src/router/router.jsx` using `react-router-dom`'s `createBrowserRouter`.

| Path | Component | Access | Description |
|------|-----------|--------|-------------|
| `/` | `LandingPage` | Public | Student self-registration kiosk |
| `/login` | `Login` | Public | Staff login |
| `/dashboard` | `newDashboard` | Staff | Main dashboard with stats |
| `/new-patient` | `NewPatient` | Nurse | Add new patient form |
| `/patient-record` | `PatientRecord` | Staff | All patient records list |
| `/individual-record/:studentId` | `IndividualRecord` | Staff | Single patient detail |
| `/add-diagnosis/:recordId` | `AddDiagnosis` | Doctor | Add diagnosis to record |
| `/medicine-inventory` | `newMedicine` | Staff | Medicine inventory list |
| `/add-medicine` | `AddMedicine` | Staff | Add new medicine form |
| `/analytics` | `newAnalytics` | Staff | Charts and analytics |
| `/notifications` | `Notifications` | Staff | Alert notifications |
| `/personnel-list` | `PersonnelList` | Doctor | Staff directory |
| `/add-personnel` | `AddPersonnel` | Doctor | Add new staff member |
| `/settings` | `Settings` | Staff | User settings |

> **Note:** `ProtectedRoute` component exists but is **not currently used** — all routes are accessible without auth verification at the router level.

---

## Page Components

### LandingPage (`/`)
- **Purpose:** Public kiosk for student self-registration
- **Features:**
  - Auto-fill when student ID is recognized (11 chars triggers lookup)
  - Department dropdown with all 6 TUP colleges
  - Validation highlighting on empty fields
  - Responsive layout with doctor image sidebar
  - "Login" button with confirmation dialog for staff access
- **Data Flow:** Submits via `useData.insertRecord()` → `POST /api/insert-record`

### Login (`/login`)
- **Purpose:** Staff authentication
- **Features:**
  - Email/password form
  - Auto-redirect to `/dashboard` if already authenticated
  - TUP branding
- **Data Flow:** `useAuth.signIn()` → Supabase Auth → fetch user profile

### Dashboard (`/dashboard`)
- **Purpose:** Main overview page after login
- **Features:**
  - Greeting with user name and role
  - 4 animated stat cards: Total Patients, Total Visits, Total Diagnoses, Medicine Inventory count
  - Today's records table
  - Role-based record click: Doctor → navigate to diagnosis, Nurse → "awaiting physician" alert
  - Auto-refresh every 15 seconds
- **Data Flow:** Reads from `useData` and `useMedicine` stores

### NewPatient (`/new-patient`)
- **Purpose:** Nurse creates a new patient record with optional diagnosis
- **Features:**
  - Student ID auto-fill from existing patients
  - Disease dropdown (fetched from `/api/get-all-diseases`)
  - Medicine dropdown with stock level display
  - Stock validation before submission
- **Data Flow:** `useData.insertRecord()` → `POST /api/insert-record`

### PatientRecord (`/patient-record`)
- **Purpose:** Browse all patient records
- **Features:**
  - Text search (name, student ID)
  - Department filter dropdown
  - Shows diagnosis from latest record
  - Click row → navigate to `/individual-record/:studentId`
- **Data Flow:** Reads from `useData.patientRecords`

### IndividualRecord (`/individual-record/:studentId`)
- **Purpose:** Detailed view of a single patient
- **Features:**
  - Personal info card (name, ID, department, contact, etc.)
  - Expandable accordion of all diagnoses
  - Each diagnosis shows: treatment, medication, quantity, notes, date
  - Buttons: Medical Certificate, Prescription
- **Data Flow:** `GET /api/get-record/:studentId`

### AddDiagnosis (`/add-diagnosis/:recordId`)
- **Purpose:** Doctor adds diagnosis to an incomplete record
- **Features:**
  - Pre-populated patient data
  - Disease selection + medicine selection with stock check
  - On submit: inserts diagnosis + decrements medicine stock
- **Data Flow:** 
  - Fetch: `GET /api/get-record-to-diagnose/:recordId`
  - Submit: `PUT /api/insert-diagnosis` + `PUT /api/update-medicine`

### MedicineInventory (`/medicine-inventory`)
- **Purpose:** View and manage medicine stock
- **Features:**
  - Searchable table with all medicine details
  - Click row → opens `MedicineForm` modal (edit/delete)
  - "Add Medicine" button → `/add-medicine`
  - Auto-refresh every 15 seconds
- **Data Flow:** Reads from `useMedicine.medicines`

### Analytics (`/analytics`)
- **Purpose:** Visual analytics dashboard
- **Features:**
  - Lazy-loaded charts (4 chart components)
  - Loading spinners per chart
- **Charts:** PatientCountsChart, PatientsPerDepartmentChart, MedicinesChart, TopDiagnosisChart

### Notifications (`/notifications`)
- **Purpose:** Disease outbreak alerts
- **Features:**
  - Mark as read (individual/all)
  - Delete (individual/all) with SweetAlert2 confirmation
  - Relative time display ("3 hours ago")
  - Polls for new alerts every 30 seconds
- **Data Flow:** Via `useNotificationStore`

### PersonnelList (`/personnel-list`)
- **Purpose:** View all clinic staff
- **Features:** Searchable list with name, role, email, sex, DOB

### Settings (`/settings`)
- **Purpose:** View/edit user profile
- **Features:** Login info display, profile info, change password modal (UI-only, not persisted)
