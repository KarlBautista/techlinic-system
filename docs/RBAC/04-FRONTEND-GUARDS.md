# Frontend RBAC — Route Guards & API Client

> **Files:** `ProtectedRoute.jsx`, `router.jsx`, `lib/api.js`

This document explains how the frontend enforces RBAC through route guards and authenticated API calls.

---

## Authenticated API Client (`src/lib/api.js`)

### What Changed
Previously, every store used raw `axios` with hardcoded URLs:
```javascript
// ❌ OLD — no authentication sent to backend
const response = await axios.get("http://localhost:3000/api/get-records");
```

Now, all stores use a centralized `api` instance:
```javascript
// ✅ NEW — JWT automatically attached
import api from "../lib/api";
const response = await api.get("/get-records");
```

### How It Works
1. Creates an axios instance with `baseURL: "http://localhost:3000/api"`
2. **Request interceptor** — before every request:
   - Gets the current Supabase session: `supabase.auth.getSession()`
   - Extracts the `access_token` (JWT)
   - Attaches it as: `Authorization: Bearer <token>`
3. **Response interceptor** — on every response:
   - Logs warnings for 401 (session expired) and 403 (insufficient permissions)

### Updated Stores
All stores were updated to use `api` instead of `axios`:

| Store | Old Import | New Import |
|-------|-----------|------------|
| `useDataStore.js` | `import axios from "axios"` | `import api from "../lib/api"` |
| `useMedicineStore.js` | `import axios from "axios"` | `import api from "../lib/api"` |
| `useChartStore.js` | `import axios from "axios"` | `import api from "../lib/api"` |
| `useNotificationStore.js` | `import axios from "axios"` | `import api from "../lib/api"` |
| `useAuthStore.js` | `import axios from "axios"` | `import api from "../lib/api"` |

Pages with direct axios calls were also updated:

| Page | Change |
|------|--------|
| `AddDiagnosis.jsx` | `import axios` → `import api from '../lib/api'` |

---

## ProtectedRoute Component (`src/components/ProtectedRoute.jsx`)

### What Changed
Previously, `ProtectedRoute` only checked if the user was **authenticated** (logged in). Any authenticated user could access any page.

Now it accepts an `allowedRoles` prop to restrict access by role:

```jsx
// Before — any authenticated user
<ProtectedRoute><Dashboard /></ProtectedRoute>

// After — role-restricted
<ProtectedRoute allowedRoles={["DOCTOR"]}><PersonnelList /></ProtectedRoute>
<ProtectedRoute allowedRoles={["NURSE"]}><NewPatient /></ProtectedRoute>
```

### Logic Flow
```
User navigates to a page
  │
  ├── Is session still loading?
  │     └── Yes → Show "Verifying session..." loader
  │
  ├── Is user authenticated?
  │     └── No → Redirect to /login
  │
  ├── Does this route have allowedRoles?
  │     ├── No → Render the page (any authenticated user)
  │     └── Yes → Is user's role in the allowed list?
  │           ├── Yes → Render the page
  │           └── No → Redirect to /dashboard (with accessDenied state)
  │
  └── Render children
```

### Access Denied Redirect
When a user is redirected due to insufficient role, the redirect includes state:
```javascript
<Navigate to="/dashboard" replace state={{ 
    accessDenied: true, 
    message: "This page requires DOCTOR access." 
}} />
```

You can use this to show a toast/alert on the dashboard if desired.

---

## Router Configuration (`src/router/router.jsx`)

### Route → Role Mapping

| Route | Allowed Roles | Page |
|-------|---------------|------|
| `/` | Public | LandingPage |
| `/login` | Public | Login |
| `/dashboard` | DOCTOR, NURSE | Dashboard |
| `/analytics` | DOCTOR, NURSE | Analytics |
| `/patient-record` | DOCTOR, NURSE | PatientRecord |
| `/individual-record/:studentId` | DOCTOR, NURSE | IndividualRecord |
| `/medicine-inventory` | DOCTOR, NURSE | MedicineInventory |
| `/add-medicine` | DOCTOR, NURSE | AddMedicine |
| `/notifications` | DOCTOR, NURSE | Notifications |
| `/settings` | DOCTOR, NURSE | Settings |
| **`/new-patient`** | **NURSE only** | NewPatient |
| **`/personnel-list`** | **DOCTOR only** | PersonnelList |
| **`/add-diagnosis/:recordId`** | **DOCTOR only** | AddDiagnosis |

---

## Navigation Sidebar (`src/components/newNavigation.jsx`)

The sidebar still uses role-based conditional rendering to show/hide links. This is **not security** — it's UX. Even if a nurse tries to type the URL `/personnel-list`, the `ProtectedRoute` will redirect them.

| Role | Visible Links |
|------|---------------|
| **NURSE** | Dashboard, Analytics, New Patient, Patient Record, Medicine Inventory, Notifications |
| **DOCTOR** | Dashboard, Analytics, Personnel List, Patient Record, Medicine Inventory, Notifications |

---

## Summary of All Changes

### New Files Created
| File | Purpose |
|------|---------|
| `src/lib/api.js` | Authenticated axios instance with JWT interceptor |

### Files Modified
| File | What Changed |
|------|-------------|
| `src/components/ProtectedRoute.jsx` | Added `allowedRoles` prop for role-based route guards |
| `src/router/router.jsx` | Added `allowedRoles` to NURSE-only and DOCTOR-only routes |
| `src/store/useDataStore.js` | Switched from `axios` to `api` |
| `src/store/useMedicineStore.js` | Switched from `axios` to `api` |
| `src/store/useChartStore.js` | Switched from `axios` to `api` |
| `src/store/useNotificationStore.js` | Switched from `axios` to `api` |
| `src/store/useAuthStore.js` | Switched from `axios` to `api` |
| `src/pages/AddDiagnosis.jsx` | Switched from `axios` to `api` |
