# 8. Data Flow

This document shows how data moves through the system for each major operation.

---

## 1. Student Self-Registration (Landing Page)

```
Student fills form on Landing Page (/)
         │
         ▼
┌─────────────────────────────┐
│ Frontend: LandingPage.jsx   │
│ - Validates form fields     │
│ - Checks if student exists  │ ──► GET /api/get-records-from-existing-patients/:id
│   (auto-fills if found)     │     (Backend → Supabase "patients" table)
│                             │
│ - On submit:                │
│   useData.insertRecord()    │
└────────────┬────────────────┘
             │ POST /api/insert-record
             │ Body: { formData: { firstName, lastName, studentId, ... } }
             ▼
┌─────────────────────────────┐
│ Backend: dataControllers.js │
│ insertRecord()              │
│                             │
│ 1. INSERT → "records" table │ ──► Status = "INCOMPLETE" (no diagnosis from kiosk)
│ 2. INSERT → "patients" table│ ──► Deduplication (ignore if exists)
│ 3. Skip diagnosis           │     (No diseaseId from landing page)
│                             │
│ Returns: { patient data }   │
└─────────────────────────────┘
```

---

## 2. Nurse Creates Patient Record (New Patient Page)

```
Nurse fills form on New Patient page (/new-patient)
         │
         ▼
┌─────────────────────────────────┐
│ Frontend: NewPatient.jsx        │
│                                 │
│ On load:                        │
│ - GET /api/get-all-diseases     │ ──► Populates disease dropdown
│ - Reads useMedicine.medicines   │ ──► Populates medication dropdown
│                                 │
│ Student ID auto-check:          │
│ - After 11 chars, calls:        │
│   getRecordsFromExistingPatient │ ──► Auto-fills if student found
│                                 │
│ On submit:                      │
│   useData.insertRecord()        │
└────────────┬────────────────────┘
             │ POST /api/insert-record
             │ Body: { formData: { ..., diseaseId, diagnosis, medication, quantity, treatment, notes } }
             ▼
┌───────────────────────────────────┐
│ Backend: dataControllers.js       │
│ insertRecord()                    │
│                                   │
│ 1. INSERT → "records" table       │ ──► Status = COMPLETE (if all fields filled)
│ 2. INSERT → "patients" table      │ ──► Deduplication
│ 3. INSERT → "diagnoses" table     │ ──► Links to record + disease
│ 4. UPDATE → "medicines" table     │ ──► Decrement stock_level by quantity
│                                   │
│ Returns: { patient, diagnosis }   │
└───────────────────────────────────┘
```

---

## 3. Doctor Adds Diagnosis (Add Diagnosis Page)

```
Doctor clicks INCOMPLETE record on Dashboard
         │ Navigate to /add-diagnosis/:recordId
         ▼
┌─────────────────────────────────┐
│ Frontend: AddDiagnosis.jsx      │
│                                 │
│ On load:                        │
│ - GET /api/get-record-to-diagnose/:recordId  → Pre-fill patient info
│ - GET /api/get-all-diseases     │ ──► Disease dropdown
│ - useMedicine.getMedicines()    │ ──► Medicine dropdown with stock
│                                 │
│ On submit (2 API calls):        │
└────────┬───────────┬────────────┘
         │           │
         ▼           ▼
┌──────────────┐  ┌──────────────────────┐
│ PUT /api/     │  │ PUT /api/             │
│ insert-       │  │ update-medicine       │
│ diagnosis     │  │                       │
│               │  │ Decrements stock by   │
│ Inserts into  │  │ prescribed quantity   │
│ "diagnoses"   │  │                       │
│ Updates record│  │                       │
│ status →      │  │                       │
│ COMPLETE      │  │                       │
└──────────────┘  └──────────────────────┘
```

---

## 4. Medicine Inventory CRUD

```
Medicine Inventory Page (/medicine-inventory)
         │
         ├──► On load: useMedicine.getMedicines()
         │    GET /api/get-medicines → Supabase "medicines" table
         │
         ├──► Add: Navigate to /add-medicine
         │    useMedicine.insertMedicine()
         │    POST /api/insert-medicine → INSERT "medicines"
         │
         ├──► Edit: Click row → MedicineForm modal
         │    useMedicine.updateMedicine()
         │    PUT /api/update-medicine → UPDATE "medicines" WHERE id = ?
         │
         └──► Delete: MedicineForm modal → Confirm
              useMedicine.deleteMedicine()
              DELETE /api/delete-medicine/:id → DELETE FROM "medicines" WHERE id = ?
```

---

## 5. Analytics Data Flow

```
Analytics Page (/analytics)
         │
         ├──► Renders 4 chart components (lazy-loaded)
         │
         ▼
┌─────────────────────────────────────────────────────┐
│ Each chart component:                                │
│                                                      │
│ PatientCountsChart                                   │
│   useEffect → fetch all 4 periods from useChartStore │
│   GET /api/get-weekly-patients                       │
│   GET /api/get-monthly-patients                      │
│   GET /api/get-quarterly-patients                    │
│   GET /api/get-yearly-patients                       │
│                                                      │
│ PatientsPerDepartmentChart                           │
│   GET /api/get-weekly-patients-per-department         │
│   GET /api/get-monthly-patients-per-department        │
│   GET /api/get-quarterly-patients-per-department      │
│   GET /api/get-yearly-patients-per-department         │
│                                                      │
│ TopDiagnosisChart                                    │
│   GET /api/get-weekly-top-diagnoses                  │
│   GET /api/get-monthly-top-diagnoses                 │
│   GET /api/get-quarterly-top-diagnoses               │
│   GET /api/get-yearly-top-diagnoses                  │
│                                                      │
│ MedicinesChart                                       │
│   Reads directly from useMedicine.medicines          │
│   (No additional API call — reuses existing data)    │
│   Shows 5 lowest stock medicines                     │
└─────────────────────────────────────────────────────┘
         │
         ▼
Backend: analyticsController.js
  - Queries Supabase "records" or "diagnoses" table
  - Filters by date range (startOf/endOf period)
  - Aggregates counts by day/week/month/department
  - Returns structured JSON
```

---

## 6. Authentication Flow

```
Login Page (/login)
         │ User enters email + password
         ▼
┌────────────────────────────────┐
│ Frontend: useAuthStore.js      │
│ signIn(email, password)        │
│                                │
│ 1. supabase.auth               │
│    .signInWithPassword()       │ ──► Supabase Auth (direct, no backend)
│                                │
│ 2. supabase.from("users")     │
│    .select("*")               │
│    .eq("id", user.id)         │ ──► Fetch profile from "users" table
│                                │
│ 3. Store in Zustand:           │
│    authenticatedUser + profile │ ──► Persisted to localStorage
│                                │
│ 4. Navigate to /dashboard     │
└────────────────────────────────┘

On App Mount (App.jsx):
  - getUser() → supabase.auth.getUser() → verify session
  - If valid, fetch profile + all core data
  - If invalid, user remains unauthenticated
```

---

## 7. Notifications & Disease Alerts Flow

```
┌──────────────────────────────────────────────────┐
│ Frontend: newNavigation.jsx                       │
│                                                   │
│ On mount + every 30 seconds:                      │
│ 1. checkForAlerts(userId)                         │
│    POST /api/check-alerts                         │
│                                                   │
│ 2. fetchNotifications(userId)                     │
│    GET /api/user/:userId                          │
│                                                   │
│ Display: unread count badge on bell icon           │
└──────────────────────┬───────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Backend: notificationController.js                │
│ checkAndCreateAlerts()                            │
│                                                   │
│ 1. Count all diagnosis records per disease        │
│ 2. Get total patient population                   │
│ 3. Calculate percentage = cases / population      │
│ 4. If cases >= 5 AND percentage >= 10%:           │
│    → ALERT! Create notification for ALL users      │
│ 5. Deduplication: skip if same alert < 1 hour ago │
│ 6. Bulk INSERT → "notifications" table            │
│                                                   │
│ Result: notification per user per alert disease    │
└──────────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│ Notifications Page (/notifications)               │
│                                                   │
│ - Shows all notifications sorted by date          │
│ - Mark as read (individual / all)                 │
│ - Delete (individual / all) with confirmation     │
│ - Relative time: "3 hours ago", "2 days ago"      │
│ - Also polls every 30 seconds                     │
│ - Browser notification on new alert               │
└──────────────────────────────────────────────────┘
```

---

## 8. Medical Certificate & Prescription Flow

```
Individual Record Page (/individual-record/:studentId)
         │
         ├──► Click "Medical Certificate" button
         │    → Opens CertificateModal
         │    → Printable TUP clinic pass with patient info
         │    → Print button triggers window.print()
         │
         └──► Click "Prescription" button
              → Opens PrescriptionModal
              → Shows prescription with diagnosis details
              → Print button triggers window.print()
              → Email button opens compose modal
                → Generates mailto: link
```
