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

- Displays patient personal info card
- Lists all diagnoses in expandable accordions
- Each diagnosis shows: diagnosis name, treatment, medication, quantity, notes, date
- Action buttons: Medical Certificate, Prescription

---

## Feature 5: New Patient (Nurse)

**Page:** New Patient (`/new-patient`)  
**File:** `pages/NewPatient.jsx`

### Form Sections:
1. **Personal Information** — same fields as Landing Page + attending physician
2. **Medical Information:**
   - Disease/Condition (dropdown from diseases API)
   - Diagnosis description
   - Medication (dropdown from medicines inventory with stock display)
   - Quantity (validated against stock)
   - Treatment instructions
   - Notes

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

### Chart 4: Medicines Stock (Horizontal Bar Chart)
- Shows 5 medicines with the lowest stock levels
- Helps identify which medicines need restocking
- No timeframe filter (current snapshot)

---

## Feature 9: Notifications & Disease Alerts

**Page:** Notifications (`/notifications`)  
**File:** `pages/Notifications.jsx`

### Alert Trigger Logic:
A disease triggers an alert when ALL conditions are met:
1. Total patient population ≥ 10
2. Disease has ≥ 5 cases
3. Disease cases ≥ 10% of total population

### How alerts are created:
1. Navigation component calls `POST /api/check-alerts` every 30 seconds
2. Backend calculates disease statistics
3. If thresholds exceeded → creates notification for **every** user
4. Deduplication: same disease alert is not duplicated within 1 hour

### Notification Actions:
- Mark individual as read
- Mark all as read
- Delete individual notification (with confirmation)
- Delete all notifications (with confirmation)

### Browser Notifications:
- On first load, requests browser notification permission
- When new alerts are detected, shows browser push notification

---

## Feature 10: Personnel Management

### View Personnel
**Page:** Personnel List (`/personnel-list`)  
**File:** `pages/PersonnelList.jsx`

- Table showing: Full Name, Role, Email, Sex, Date of Birth
- Search by name
- "Add Personnel" button → `/add-personnel`

### Add Personnel
**Page:** Add Personnel (`/add-personnel`)  
**File:** `pages/AddPersonnel.jsx`

- Form fields: First Name, Last Name, Email, Password, Confirm Password, Address, DOB, Role (NURSE/DOCTOR), Sex
- Password validation: minimum 8 characters, must match confirmation
- On submit: creates Supabase Auth user + inserts into `users` table

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

### Displays:
- Login info: email, masked password (dots)
- Personal info: name, gender, address, DOB, role

### Modals (UI-only):
- Change Password modal (form exists but does **not** persist changes to backend)
- Edit Profile modal (form exists but does **not** persist changes to backend)

> **Note:** Settings save functionality is UI-only — changes are not actually saved to the database.
