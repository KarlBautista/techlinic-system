# 9. Features Guide

Detailed breakdown of every feature in the TechClinic system.

---

## Feature 1: Student Self-Registration

**Page:** Landing Page (`/`)  
**Who uses it:** Students  
**File:** `pages/LandingPage.jsx`

### How it works:
1. Student opens the app on the clinic kiosk/tablet (root URL `/`)
2. Fills in personal information:
   - Student ID (11 characters)
   - First Name, Last Name
   - Contact Number, Email
   - Date of Birth, Address
   - Year Level (1st–4th)
   - Department (dropdown with 6 colleges)
   - Sex (Male/Female)
3. If the Student ID matches an existing patient, a confirmation dialog appears asking if they want to auto-fill their info
4. Student clicks "Submit" → record is created with status `INCOMPLETE`
5. Success alert shown → form resets

### Auto-fill Logic:
- When `studentId` reaches 11 characters, the system calls `getRecordsFromExistingPatient()`
- If a match is found, SweetAlert2 asks: "Would you like to auto-fill?"
- On confirm: all personal fields are populated from the existing patient record

---

## Feature 2: Staff Login

**Page:** Login (`/login`)  
**Who uses it:** Nurses, Doctors  
**File:** `pages/Login.jsx`

### How it works:
1. Staff member enters email and password
2. System authenticates via Supabase Auth
3. On success: fetches user profile from `users` table
4. Stores auth state in localStorage (persistent session)
5. Redirects to `/dashboard`

### Session Persistence:
- Auth state is stored in localStorage via Zustand's `persist` middleware
- On app reload, `App.jsx` calls `getUser()` to verify the session is still valid
- If valid: user stays logged in
- If expired: user needs to log in again

---

## Feature 3: Dashboard

**Page:** Dashboard (`/dashboard`)  
**Who uses it:** All staff  
**File:** `pages/newDashboard.jsx`

### Stat Cards:
| Card | Data Source | Calculation |
|------|-----------|-------------|
| Total Patients | `useData.patientsData` | Array length |
| Total Visits | `useData.patientRecords` | Array length |
| Total Diagnoses | `useData.patientRecords` | Sum of all `diagnoses` arrays |
| Medicine Inventory | `useMedicine.medicines` | Array length |

### Today's Records Table:
- Filters `patientRecords` by today's date
- Shows: Time, Patient Name, Student ID, Department, Status (COMPLETE/INCOMPLETE)
- Color coding: Green tag = COMPLETE, Red tag = INCOMPLETE
- **Hover effect:** All data cells show underline + patient name turns `#b01c34` (brand red) on row hover (`group-hover:underline` + `group-hover:text-[#b01c34]`)

### Role-Based Click Behavior:
- **Doctor** clicks an INCOMPLETE record → navigates to `/add-diagnosis/:recordId`
- **Nurse** clicks an INCOMPLETE record → SweetAlert: "Awaiting physician's diagnosis"
- Clicking a COMPLETE record → navigates to `/individual-record/:studentId`

### Auto-Refresh:
- `setInterval` every 15 seconds: re-fetches records and medicines

---

## Feature 4: Patient Record Management

### Patient List
**Page:** Patient Record (`/patient-record`)  
**File:** `pages/PatientRecord.jsx`

- Shows all patient records in a searchable table
- **Search:** filters by name or student ID
- **Filter:** dropdown to filter by department
- Click any row → navigate to `/individual-record/:studentId`

### Individual Record
**Page:** Individual Record (`/individual-record/:studentId`)  
**File:** `pages/IndividualRecord.jsx`

- Displays patient personal info card (profile banner with gradient, contact cards grid)
- Lists all visit records with clickable rows → opens `DiagnosisModal`
- Each record shows: diagnosis name, date, medication, and status badge
- **New Visit button:** Passes the current patient's data via React Router navigation state to `/new-patient`, so the NewPatient form is pre-filled without an extra API call:
  ```js
  navigate('/new-patient', { state: { patientData: { studentId, firstName, lastName, ... } } })
  ```

---

## Feature 5: New Patient (Nurse)

**Page:** New Patient (`/new-patient`)  
**File:** `pages/NewPatient.jsx`

### Form Sections:
1. **Personal Information** — same fields as Landing Page + attending physician
2. **Medical Information:**
   - Disease/Condition (dropdown from diseases API)
   - **Add Disease inline:** A "+" button next to the disease dropdown toggles an inline input + "Add" button. Calls `POST /api/add-disease` to add a new disease. On success, the disease list is refreshed, and the new disease is auto-selected in the dropdown.
   - Diagnosis description
   - Medication (dropdown from medicines inventory with stock display)
   - Quantity (validated against stock)
   - Treatment instructions
   - Notes

### Pre-fill from Navigation State:
- If navigated from Individual Record's "New Visit" button, the form is pre-filled with the patient's existing data from `location.state.patientData` — no additional API call is needed.

### Stock Validation:
- When quantity is entered, checks if `quantity <= medication.stock_level`
- If insufficient stock, shows warning and prevents submission

### Record Status Logic:
- All medical fields filled → status = `COMPLETE`
- Any medical field empty → status = `INCOMPLETE` (awaiting doctor)

---

## Feature 6: Diagnosis (Doctor)

**Page:** Add Diagnosis (`/add-diagnosis/:recordId`)  
**File:** `pages/AddDiagnosis.jsx`

### Access:
- Doctor clicks an INCOMPLETE record from the Dashboard
- Navigated to `/add-diagnosis/:recordId`

### How it works:
1. Pre-populates all patient info from the record
2. Doctor selects disease, enters diagnosis, selects medication
   - **Add Disease inline:** Same as NewPatient — a "+" button next to the disease dropdown toggles an inline input + "Add" button. Calls `POST /api/add-disease` to add a new disease. On success, the disease list is refreshed and the new disease is auto-selected.
3. Validates stock availability
4. On submit:
   - `PUT /api/insert-diagnosis` → inserts diagnosis + marks record COMPLETE
   - `PUT /api/update-medicine` → decrements stock by prescribed quantity
5. Navigates to individual record page on success

---

## Feature 7: Medicine Inventory

### View Medicines
**Page:** Medicine Inventory (`/medicine-inventory`)  
**File:** `pages/MedicineInventory.jsx` (imported as `newMedicine`)

- Searchable table showing all medicines
- Columns: Name, Generic Name, Brand, Type, Dosage, Unit, Stock Level, Batch Number, Expiry Date
- Auto-refreshes every 15 seconds

### Add Medicine
**Page:** Add Medicine (`/add-medicine`)  
**File:** `pages/AddMedicine.jsx`

- Form fields: Name, Generic, Brand, Type, Dosage, Unit, Stock, Batch, Expiry
- Submits via `useMedicine.insertMedicine()`

### Edit/Delete Medicine
**Component:** `MedicineForm.jsx` (modal)

- Click a medicine row → opens edit modal
- Edit: modify any field → saves via `useMedicine.updateMedicine()`
- Delete: confirmation dialog → `useMedicine.deleteMedicine()`
- Page reloads after update/delete (uses `window.location.reload()`)

---

## Feature 8: Analytics & Charts

**Page:** Analytics (`/analytics`)  
**File:** `pages/Analytics.jsx` (imported as `newAnalytics`)

### Chart 1: Patient Counts (Area Chart)
- Shows total patient visits over time
- Timeframes: Weekly (Mon-Sun), Monthly (Week 1-4), Quarterly (3 months), Yearly (Jan-Dec)
- Toggle between timeframes with buttons

### Chart 2: Patients Per Department (Donut Chart)
- Shows distribution of patients across 6 TUP colleges
- Center label: total patients
- Same 4 timeframe options

### Chart 3: Top Diagnoses (Pareto + Line Chart)
- **Pareto chart:** Bar chart of top 5 diagnoses + cumulative percentage line
- **Trend chart:** Line chart showing diagnosis cases over time
- Same 4 timeframe options

### Chart 4: Lowest Stock (Horizontal Bar Chart)
- **Title:** "Lowest Stock" (displayed in `MedicinesChart.jsx`)
- Shows 5 medicines with the lowest stock levels
- Subtitle: "Total medicines tracked: {count}"
- Helps identify which medicines need restocking
- No timeframe filter (current snapshot)

---

## Feature 9: Notifications & Disease Alerts

**Page:** Notifications (`/notifications`)  
**File:** `pages/Notifications.jsx`

### Alert Types:
1. **Disease Outbreak Alerts** — triggered when a disease exceeds threshold:
   - Total patient population ≥ 10
   - Disease has ≥ 5 cases
   - Disease cases ≥ 10% of total population
2. **Low Stock Medicine Alerts** — triggered when any medicine has `stock_level ≤ 10` (out-of-stock = 0 has a stronger message)

### How alerts are created:
1. Navigation component calls `POST /api/check-alerts` every 30 seconds
2. Backend calculates disease statistics **and** checks medicine stock levels
3. If thresholds exceeded → creates notification for **every** user
4. Deduplication: same alert is not duplicated within 1 hour

### Redesigned Notification UI:
- Modern card-based layout with icon + accent color per notification type:
  - Disease alerts → amber icon (`fa-triangle-exclamation`)
  - Low stock alerts → rose icon (`fa-pills`)
  - System updates → blue icon (`fa-circle-info`)
  - Default → gray icon (`fa-bell`)
- Unread indicator: colored dot + bolder text styling
- Inline delete button (appears on hover)
- Clean header with unread count summary + "Mark all read" / "Clear all" buttons

### Notification Actions:
- Click unread notification → auto-marks as read
- Mark all as read
- Delete individual notification (with SweetAlert confirmation)
- Delete all notifications (with SweetAlert confirmation)

### `_isFetching` Guard:
- `useNotificationStore` uses an `_isFetching` boolean to prevent concurrent polling calls from stacking up. If a fetch is already in progress, subsequent calls are skipped.

### Browser Notifications:
- On first load, requests browser notification permission
- When new alerts are detected, shows browser push notification

### Test Script:
- **File:** `Backend/test-notifications.js`
- Commands:
  - `node test-notifications.js seed` — Inserts test patients + low-stock medicines
  - `node test-notifications.js check` — Triggers alert check manually
  - `node test-notifications.js cleanup` — Removes seeded test data
  - `node test-notifications.js full` — Seed → Check → verify (no cleanup)

---

## Feature 10: Personnel Management

### View Personnel
**Page:** Personnel List (`/personnel-list`)  
**File:** `pages/PersonnelList.jsx`

- **Modern table design** with responsive columns (Email hidden on mobile, Sex hidden on small screens)
- Search by name or email
- **Role filter dropdown:** filter personnel by role (All, Doctor, Nurse)
- **Initials avatars:** each row shows a circular avatar with the user's initials
- **Role badges:** color-coded badges — blue for Doctor, green for Nurse
- **Hover underline** on data cells (matching Dashboard/PatientRecord style)
- "Add Personnel" button opens an **inline modal** (no separate page/route)

### Add Personnel (Modal)
**Component:** Inline modal within `PersonnelList.jsx`  
**No separate route** — the `/add-personnel` route is no longer used.

- Animated modal with backdrop (open/close transitions via `isModalVisible` / `isModalClosing` state)
- Form fields: First Name, Last Name, Email, Password, Confirm Password, Address, DOB, Role (NURSE/DOCTOR), Sex
- Password validation: minimum 8 characters, must match confirmation
- On submit: creates Supabase Auth user + inserts into `users` table
- On success: modal closes + personnel list refreshes automatically

---

## Feature 11: Medical Certificates

**Component:** `CertificateModal.jsx`  
**Accessed from:** Individual Record page

- Generates printable TUP clinic pass / medical certificate
- Shows patient name, student ID, date
- Blank spaces for: findings, recommendations, days excused
- Print button → `window.print()`

---

## Feature 12: Prescriptions

**Component:** `PrescriptionModal.jsx`  
**Accessed from:** Individual Record page

- Generates printable prescription form
- Shows diagnosis details and medication
- Checkboxes for: certificate type, referral, quarantine
- Print button → `window.print()`
- Email button → opens compose modal → generates `mailto:` link

---

## Feature 13: Settings

**Page:** Settings (`/settings`)  
**File:** `pages/Settings.jsx`

### Layout:
- **Profile Banner:** Gradient header with avatar initials, display name ("Dr. FirstName LastName"), user ID, role badge
- Two-column info card grid (Personal Information + Login & Security)
- Full-width **Digital Signature** card

### Personal Information Card:
- First/Last Name, Gender, DOB, Address, Role
- "Edit Profile" button → opens **Edit Profile modal** (changes **are** persisted via `updateProfile()` → Supabase `users` table)

### Login & Security Card:
- Email, masked password, account status, last sign-in timestamp
- "Change" button → opens Change Password modal (UI-only, not yet wired to backend)

### Digital Signature Card:
- Shows current signature image (from `userProfile.signature_url`) or empty placeholder
- "Add Signature" / "Update Signature" button → opens **Signature Modal**
- **Signature Modal** embeds the `SignaturePad` component:
  - **Draw mode:** Canvas-based signature drawing (via `react-signature-canvas`)
  - **Upload mode:** Upload a PNG/JPG image file (max 2MB)
  - Clear and save buttons
- On save: `uploadSignature(dataUrl)` converts to blob → uploads to Supabase Storage (`signatures` bucket) → saves public URL to `users.signature_url`

## Feature 14: Signature System

### SignaturePad Component
**File:** `components/SignaturePad.jsx`

- Two input modes: **Draw** (canvas) and **Upload** (file input)
- Manual canvas trimming (avoids `trim-canvas` ESM/CJS compatibility issues with Vite)
- Props: `onSave(dataUrl)`, `existingSignature`, `onClear()`
- File upload validation: image types only, max 2MB

### Signature in DiagnosisModal
**File:** `components/DiagnosisModal.jsx`

- When a record is opened, the modal fetches the attending physician's signature via `attending_physician_id`
- Queries `users` table for `signature_url`, `first_name`, `last_name`, `role`
- Renders the signature image in the diagnosis view if available
