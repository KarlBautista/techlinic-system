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
  - Today's records table with **hover underline** effect (`group-hover:underline`) on all data cells + patient name turns brand red on hover
  - Role-based record click: Doctor → navigate to diagnosis, Nurse → "awaiting physician" alert
  - Auto-refresh every 15 seconds
- **Data Flow:** Reads from `useData` and `useMedicine` stores

### NewPatient (`/new-patient`)
- **Purpose:** Nurse creates a new patient record with optional diagnosis
- **Features:**
  - Student ID auto-fill from existing patients
  - **Pre-fill from navigation state:** When navigated from Individual Record's "New Visit" button, the form is pre-filled via `location.state.patientData` (no re-fetch)
  - Disease dropdown (fetched from `/api/get-all-diseases`)
  - **Add Disease inline:** "+" button toggles an inline input to add a new disease via `POST /api/add-disease`
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
  - Profile banner card with gradient header, avatar initials, and patient badges (sex, year, last visit)
  - Contact cards grid (phone, email, address)
  - Visit records list with clickable rows → opens `DiagnosisModal`
  - **"New Visit" button:** Passes patient data via React Router navigation state to `/new-patient` (avoids re-fetch)
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
- **Charts:** PatientCountsChart, PatientsPerDepartmentChart, MedicinesChart (title: "Lowest Stock"), TopDiagnosisChart

### Notifications (`/notifications`)
- **Purpose:** Disease outbreak alerts and low stock medicine alerts
- **Features:**
  - Redesigned card-based UI with context-aware icons (disease=amber, stock=rose, system=blue)
  - Unread indicator dot + bold text styling
  - Click-to-mark-as-read, hover-to-reveal delete button
  - Mark all as read / clear all buttons
  - Relative time display ("3m ago", "2h ago")
  - `_isFetching` guard prevents concurrent polling
- **Data Flow:** Via `useNotificationStore`

### PersonnelList (`/personnel-list`)
- **Purpose:** View all clinic staff
- **Features:** Modern responsive table (name, role, email, sex, DOB). "Add Personnel" opens an inline modal with animated transitions (no separate route/page).

### Settings (`/settings`)
- **Purpose:** View/edit user profile and manage digital signature
- **Features:**
  - Profile banner with gradient header + avatar initials
  - Personal Info card (editable via modal → persisted with `updateProfile()`)
  - Login & Security card (email, password change modal — UI-only)
  - **Digital Signature card:** View current signature image, add/update via `SignaturePad` modal
  - Signature is uploaded to Supabase Storage (`signatures` bucket) and URL saved to `users.signature_url`

### Key Shared Components

| Component | File | Purpose |
|-----------|------|--------|
| `newNavigation` | `components/newNavigation.jsx` | Sidebar with notification badge + polling |
| `DiagnosisModal` | `components/DiagnosisModal.jsx` | View diagnosis details + attending physician's signature |
| `SignaturePad` | `components/SignaturePad.jsx` | Draw or upload signature (draw/upload modes, canvas trimming) |
| `CertificateModal` | `components/CertificateModal.jsx` | Printable TUP clinic pass |
| `PrescriptionModal` | `components/PrescriptionModal.jsx` | Printable prescription form |
| `MedicineForm` | `components/MedicineForm.jsx` | Edit/delete medicine modal |
| `PageLoader` | `components/PageLoader.jsx` | Loading spinner component |
| `ProtectedRoute` | `components/ProtectedRoute.jsx` | Auth-guarded route wrapper |
