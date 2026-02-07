# 7. State Management

The app uses **Zustand** for state management. There are 5 stores, each managing a specific domain.

---

## Store Overview

| Store | File | Persisted? | Purpose |
|-------|------|-----------|---------|
| `useAuth` | `useAuthStore.js` | Yes (localStorage) | Authentication & user data |
| `useData` | `useDataStore.js` | Yes (localStorage) | Patient records & patients |
| `useMedicine` | `useMedicineStore.js` | No | Medicine inventory |
| `useChart` | `useChartStore.js` | No | Analytics chart data |
| `useNotificationStore` | `useNotificationStore.js` | No | Notifications & alerts |

---

## 1. `useAuth` — Authentication Store

**Persistence:** localStorage key `auth-storage`

### State
```js
{
  authenticatedUser: null,   // Supabase auth user object
  userProfile: null,         // User row from "users" table
  isLoading: false,          // Loading indicator
  password: null,            // Stored password (for settings display)
  allUsers: null             // Array of all staff members
}
```

### Actions
| Action | What It Does |
|--------|-------------|
| `signIn(email, password)` | Signs in via Supabase Auth, fetches user profile |
| `signUp(email, password)` | Creates Supabase Auth account |
| `signOut()` | Signs out, clears state, navigates to `/` |
| `getUser()` | Gets current auth user + profile from Supabase |
| `getAllUsers()` | Fetches all staff via `GET /api/get-all-users` |
| `authListener()` | Subscribes to Supabase auth state changes |

### How Auth Works
1. User enters email/password on Login page
2. `signIn()` calls `supabase.auth.signInWithPassword()`
3. On success, fetches user profile from `users` table using the auth user's ID
4. Stores both `authenticatedUser` and `userProfile` in Zustand (persisted to localStorage)
5. User is redirected to `/dashboard`

---

## 2. `useData` — Patient Data Store

**Persistence:** localStorage key `data-storage`

### State
```js
{
  patientRecords: null,      // All records with diagnoses (from GET /api/get-records)
  patientsData: null,        // All unique patients (from GET /api/get-patients)
  isLoadingRecords: false,
  isLoadingPatients: false
}
```

### Actions
| Action | What It Does |
|--------|-------------|
| `insertRecord(formData)` | `POST /api/insert-record` — creates new visit |
| `getRecords()` | `GET /api/get-records` — fetches all records with diagnoses |
| `getPatients()` | `GET /api/get-patients` — fetches unique patient list |
| `getRecordsFromExistingPatient(studentId)` | `GET /api/get-records-from-existing-patients/:id` |
| `insertPersonnel(personnelData)` | `POST /api/insert-personnel` — creates staff |
| `insertDiagnosis()` | `POST /api/insert-diagnose` (partially implemented) |

---

## 3. `useMedicine` — Medicine Store

**Persistence:** None

### State
```js
{
  medicines: null   // Array of all medicines
}
```

### Actions
| Action | What It Does |
|--------|-------------|
| `insertMedicine(medicine)` | `POST /api/insert-medicine` |
| `getMedicines()` | `GET /api/get-medicines` |
| `updateMedicine(medicine)` | `PUT /api/update-medicine` |
| `deleteMedicine(medicineId)` | `DELETE /api/delete-medicine/:id` |

---

## 4. `useChart` — Analytics Chart Store

**Persistence:** None

### State
```js
{
  // Patient counts
  weeklyPatientCount: null,
  monthlyPatientCount: null,
  quarterlyPatientCount: null,
  yearlyPatientCount: null,
  
  // Per department
  weeklyPatientPerDepartment: null,
  monthlyPatientPerDepartment: null,
  quarterlyPatientPerDepartment: null,
  yearlyPatientPerDepartment: null,
  
  // Top diagnoses
  weeklyTopDiagnoses: null,
  monthlyTopDiagnoses: null,
  quarterlyTopDiagnoses: null,
  yearlyTopDiagnoses: null
}
```

### Actions
Each period has 3 fetch functions (12 total):
- `getWeeklyPatientCount()`, `getWeeklyPatientsPerDepartment()`, `getWeeklyTopDiagnoses()`
- `getMonthlyPatientCount()`, `getMonthlyPatientsPerDepartment()`, `getMonthlyTopDiagnoses()`
- `getQuarterlyPatientCount()`, `getQuarterlyPatientsPerDepartment()`, `getQuarterlyTopDiagnoses()`
- `getYearlyPatientCount()`, `getYearlyPatientsPerDepartment()`, `getYearlyTopDiagnoses()`

---

## 5. `useNotificationStore` — Notifications Store

**Persistence:** None

### State
```js
{
  notifications: [],    // Array of notification objects
  unreadCount: 0,       // Count of unread notifications
  isLoading: false,
  error: null,
  lastChecked: null     // ISO timestamp of last alert check
}
```

### Actions
| Action | What It Does |
|--------|-------------|
| `fetchNotifications(userId)` | `GET /api/user/:userId` |
| `checkForAlerts(userId)` | `POST /api/check-alerts` → then refetch |
| `markAsRead(notificationId, userId)` | `PATCH /api/:notificationId/read` |
| `markAllAsRead(userId)` | `PATCH /api/user/:userId/read-all` |
| `deleteNotification(notificationId, userId)` | `DELETE /api/:notificationId` |
| `deleteAllNotifications(userId)` | `DELETE /api/user/:userId/all` |

### Exported Helpers
- `requestNotificationPermission()` — Requests browser push notification permission
- `showBrowserNotification(title, options)` — Shows a browser notification

---

## Data Initialization

On app mount (`App.jsx`), the following data is fetched in parallel:

```js
// App.jsx useEffect
await getUser();                    // Auth store
await Promise.all([
    getRecords(),                   // Data store
    getPatients(),                  // Data store
    getMedicines(),                 // Medicine store
    getAllUsers(),                   // Auth store
]);
```

This ensures all core data is available when any page renders.
