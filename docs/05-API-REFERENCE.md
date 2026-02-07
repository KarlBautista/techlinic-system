# 5. API Reference

**Base URL:** `http://localhost:3000/api`

All endpoints return JSON in the format:
```json
{
  "success": true/false,
  "data": { ... },       // on success
  "error": "message"     // on failure
}
```

---

## Patient Records (`dataRoutes.js`)

### POST `/api/insert-record`
Create a new patient visit record. Also inserts into `patients` table and optionally creates a diagnosis.

**Request Body:**
```json
{
  "formData": {
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "studentId": "TUPM-21-0001",
    "contactNumber": "09123456789",
    "yearLevel": "3rd",
    "department": "College of Engineering",
    "sex": "Male",
    "email": "juan@tup.edu.ph",
    "address": "Manila",
    "dateOfBirth": "2002-01-15",
    "attendingPhysician": "Dr. Smith",
    "diseaseId": 1,
    "diagnosis": "Common Cold",
    "medication": { "id": 5, "medicine_name": "Paracetamol", "stock_level": 100 },
    "quantity": "2",
    "treatment": "Rest and fluids",
    "notes": "Follow up in 3 days"
  }
}
```

**What happens internally:**
1. Inserts into `records` table (status = `INCOMPLETE` if diagnosis fields are empty, else `COMPLETE`)
2. Inserts into `patients` table (silently fails if student already exists)
3. If `diseaseId` and `diagnosis` are provided, inserts into `diagnoses` table
4. If medication is provided, decrements `stock_level` in `medicines` table

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "patient": [{ /* record data */ }],
    "diagnosis": [{ /* diagnosis data */ }]
  }
}
```

---

### GET `/api/get-records`
Fetch all patient records with their diagnoses.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "Juan",
      "last_name": "Dela Cruz",
      "student_id": "TUPM-21-0001",
      "department": "College of Engineering",
      "status": "COMPLETE",
      "created_at": "2026-02-07T08:00:00Z",
      "diagnoses": [
        {
          "id": 1,
          "diagnosis": "Common Cold",
          "medication": "Paracetamol",
          "quantity": 2,
          "treatment": "Rest",
          "notes": "..."
        }
      ]
    }
  ]
}
```

---

### GET `/api/get-record/:studentId`
Fetch all records for a specific student (with diagnoses).

**URL Param:** `studentId` — e.g., `TUPM-21-0001`

**Response:** Same structure as `get-records` but filtered by student ID.

---

### GET `/api/get-record-to-diagnose/:recordId`
Fetch a single record by its ID (for the diagnosis form).

**URL Param:** `recordId` — record ID number

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [{ /* single record without diagnoses */ }]
}
```

---

### GET `/api/get-records-from-existing-patients/:studentId`
Check if a student already exists in the `patients` table (for auto-fill).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [{ "first_name": "Juan", "last_name": "Dela Cruz", ... }]
}
```

---

### GET `/api/get-patients`
Fetch all unique patients.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [{ "student_id": "TUPM-21-0001", "first_name": "Juan", ... }]
}
```

---

### PUT `/api/insert-diagnosis`
Add a diagnosis to an existing incomplete record and mark it as `COMPLETE`.

**Request Body:**
```json
{
  "patientInput": {
    "id": 1,
    "studentId": "TUPM-21-0001",
    "diseaseId": 3,
    "diagnosis": "Flu",
    "medication": { "medicine_name": "Biogesic" },
    "quantity": 5,
    "treatment": "Bed rest",
    "notes": "Take meds every 4 hours"
  }
}
```

**Response:** `200 OK`
```json
{ "success": true, "message": "success diagnosis" }
```

---

### GET `/api/get-all-users`
Fetch all clinic staff (users table).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [{ "id": "uuid", "first_name": "Dr.", "last_name": "Smith", "role": "DOCTOR", ... }]
}
```

---

### POST `/api/insert-personnel`
Create a new clinic staff member (creates Supabase Auth user + inserts into users table).

**Request Body:**
```json
{
  "personnel": {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@tup.edu.ph",
    "password": "securepass123",
    "address": "Manila",
    "date_of_birth": "1990-05-20",
    "role": "NURSE",
    "sex": "Female"
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Personnel added successfully",
  "data": {
    "user_id": "uuid",
    "email": "jane@tup.edu.ph",
    "full_name": "Jane Doe",
    "role": "NURSE"
  }
}
```

---

## Medicine Inventory (`medicineRoutes.js`)

### POST `/api/insert-medicine`
Add a new medicine to inventory.

**Request Body:**
```json
{
  "medicine": {
    "name": "Paracetamol",
    "generic": "Acetaminophen",
    "brand": "Biogesic",
    "type": "Analgesic",
    "dosage": "500mg",
    "unit": "tablet",
    "stock": 200,
    "batch": "BATCH-001",
    "expiry": "2027-12-31"
  }
}
```

---

### GET `/api/get-medicines`
Fetch all medicines.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "medicine_name": "Paracetamol",
      "generic_name": "Acetaminophen",
      "brand": "Biogesic",
      "type": "Analgesic",
      "dosage": "500mg",
      "unit_of_measure": "tablet",
      "stock_level": 200,
      "batch_number": "BATCH-001",
      "expiry_date": "2027-12-31"
    }
  ]
}
```

---

### PUT `/api/update-medicine`
Update an existing medicine.

**Request Body:**
```json
{
  "medicine": {
    "id": 1,
    "medicine_name": "Paracetamol",
    "generic_name": "Acetaminophen",
    "brand": "Biogesic",
    "type": "Analgesic",
    "dosage": "500mg",
    "unit_of_measure": "tablet",
    "stock_level": 150,
    "batch_number": "BATCH-002",
    "expiry_date": "2028-06-30"
  }
}
```

---

### DELETE `/api/delete-medicine/:medicineId`
Delete a medicine by ID.

**URL Param:** `medicineId` — medicine ID number

---

## Analytics (`analyticsRoutes.js`)

All analytics endpoints are **GET** requests with no parameters. They use server-side date calculations (PHT timezone, UTC+8).

### Patient Count Over Time

| Endpoint | Period | Response Data Shape |
|----------|--------|-------------------|
| `/api/get-weekly-patients` | Mon–Sun | `{ Mon: 5, Tue: 3, ... }` |
| `/api/get-monthly-patients` | 4 weeks | `{ week1: { count: 10 }, week2: { count: 8 }, ... }` |
| `/api/get-quarterly-patients` | 3 months | `{ "2026-01-15": 3, "2026-01-16": 5, ... }` (date counts) |
| `/api/get-yearly-patients` | 12 months | `{ Jan: 20, Feb: 15, ... }` |

### Patients Per Department

| Endpoint | Period |
|----------|--------|
| `/api/get-weekly-patients-per-department` | Current week |
| `/api/get-monthly-patients-per-department` | Current month |
| `/api/get-quarterly-patients-per-department` | Current quarter |
| `/api/get-yearly-patients-per-department` | Current year |

**Response Shape (all department endpoints):**
```json
{
  "success": true,
  "data": {
    "College of Architecture and Fine Arts": 5,
    "College of Science": 12,
    "College of Liberal Arts": 3,
    "College of Industrial Education": 7,
    "College of Engineering": 20,
    "College of Industrial Technology": 8
  },
  "period": { "type": "week", "range": "Feb 03 - Feb 09, 2026" }
}
```

### Top Diagnoses (Pareto)

| Endpoint | Period |
|----------|--------|
| `/api/get-weekly-top-diagnoses` | Current week |
| `/api/get-monthly-top-diagnoses` | Current month |
| `/api/get-quarterly-top-diagnoses` | Current quarter |
| `/api/get-yearly-top-diagnoses` | Current year |

**Response Shape (all top diagnoses endpoints):**
```json
{
  "success": true,
  "data": {
    "labels": ["Monday", "Tuesday", ...],
    "series": [
      { "name": "Common Cold", "data": [2, 1, 3, 0, 1, 0, 0] }
    ],
    "topDiagnosesCount": [15, 10, 8, 5, 3],
    "topDiagnosesNames": ["Common Cold", "Flu", "Headache", "Allergy", "Cough"],
    "cumulativePercent": [37, 61, 80, 93, 100],
    "period": { "type": "week", "range": "Feb 03 - Feb 09, 2026" }
  }
}
```

---

## Diseases (`diseasesRoute.js`)

### GET `/api/get-all-diseases`
Fetch all diseases in the catalog.

**Response:**
```json
{
  "success": true,
  "data": [{ "id": 1, "name": "Common Cold" }, { "id": 2, "name": "Flu" }]
}
```

---

### GET `/api/get-all-number-of-diseases`
Get disease case statistics with outbreak alert logic.

**Alert Logic:**
- `MIN_POPULATION = 10` — minimum patients before percentages are meaningful
- `MIN_CASES = 5` — minimum cases before alert triggers
- `ALERT_THRESHOLD = 10%` — percentage threshold for alarm

**Response:**
```json
{
  "success": true,
  "total_population": 150,
  "data": [
    {
      "disease_id": 1,
      "disease_name": "Common Cold",
      "total_cases": 25,
      "percentage": 16.67,
      "alert": true,
      "status": "ALERT"
    }
  ]
}
```

---

## Notifications (`notificationRoutes.js`)

### POST `/api/check-alerts`
Check disease statistics and create notifications for any diseases that exceed the alert threshold. Prevents duplicate notifications within 1 hour.

**Response:**
```json
{
  "success": true,
  "message": "Created 6 notifications",
  "notifications": [{ /* notification objects */ }]
}
```

---

### GET `/api/user/:userId`
Get all notifications for a specific user.

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "title": "⚠️ Disease Alert: Common Cold",
      "message": "25 cases detected (16.67% of population). Immediate attention required.",
      "is_read": false,
      "metadata": { "disease_id": 1, "total_cases": 25, "percentage": 16.67 },
      "created_at": "2026-02-07T10:00:00Z"
    }
  ],
  "unreadCount": 3
}
```

---

### PATCH `/api/:notificationId/read`
Mark a single notification as read.

### PATCH `/api/user/:userId/read-all`
Mark all notifications as read for a user.

### DELETE `/api/:notificationId`
Delete a single notification.

### DELETE `/api/user/:userId/all`
Delete all notifications for a user.
