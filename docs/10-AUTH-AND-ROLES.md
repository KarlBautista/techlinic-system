# 10. Authentication & Roles

## Authentication Method

TechClinic uses **Supabase Auth** with email/password authentication.

---

## How Authentication Works

### Login Flow
```
1. User enters email + password on /login
2. Frontend calls supabase.auth.signInWithPassword({ email, password })
3. Supabase validates credentials → returns auth token
4. Frontend queries "users" table to get profile (role, name, etc.)
5. Both auth user + profile are persisted to localStorage
6. User redirected to /dashboard
```

### Session Persistence
```
1. On app load (App.jsx), calls supabase.auth.getUser()
2. If session is valid → fetch profile → user stays logged in
3. If session expired → user must log in again
4. localStorage keys: "auth-storage" (Zustand persist)
```

### Sign Out
```
1. Calls supabase.auth.signOut()
2. Clears all Zustand state
3. Navigates to / (landing page)
```

---

## User Roles

There are two roles in the system:

### NURSE
| Permission | Details |
|-----------|---------|
| View Dashboard | ✅ Full access |
| Add New Patient | ✅ Can create records from /new-patient |
| View Patient Records | ✅ Browse and search |
| View Individual Record | ✅ See patient details |
| Add Diagnosis | ❌ Gets "awaiting physician" message |
| Medicine Inventory | ✅ Full CRUD |
| Analytics | ✅ View all charts |
| Notifications | ✅ View and manage |
| Personnel List | ❌ Not shown in navigation |
| Add Personnel | ❌ Not accessible |
| Settings | ✅ View profile |

### DOCTOR
| Permission | Details |
|-----------|---------|
| View Dashboard | ✅ Full access |
| Add New Patient | ❌ Not shown in navigation |
| View Patient Records | ✅ Browse and search |
| View Individual Record | ✅ See patient details |
| Add Diagnosis | ✅ Can diagnose incomplete records |
| Medicine Inventory | ✅ Full CRUD |
| Analytics | ✅ View all charts |
| Notifications | ✅ View and manage |
| Personnel List | ✅ Visible in navigation |
| Add Personnel | ✅ Can add new staff |
| Settings | ✅ View profile |

---

## How Roles Affect the UI

### Navigation (newNavigation.jsx)
```jsx
// NURSE sees:
- Dashboard
- New Patient      ← Only for NURSE
- Patient Record
- Medicine Inventory
- Analytics
- Notifications

// DOCTOR (non-NURSE) sees:
- Dashboard
- Patient Record
- Medicine Inventory
- Personnel List   ← Only for non-NURSE
- Analytics
- Notifications
```

### Dashboard Record Click (newDashboard.jsx)
```jsx
// When clicking an INCOMPLETE record:
if (role === "DOCTOR") {
    navigate(`/add-diagnosis/${recordId}`);   // Can diagnose
} else {
    Swal.fire("Awaiting physician's diagnosis");  // Can't diagnose
}
```

---

## Creating Users

### Method 1: Add Personnel Page (Frontend)
- Navigate to `/add-personnel`
- Fill in form with email, password, and role
- Creates Supabase Auth user + inserts to `users` table

### Method 2: Backend Script
- `Backend/createUser.js` — utility script for direct user creation

### What Happens on User Creation:
1. `supabaseAdmin.auth.admin.createUser()` — creates auth account (using service role key)
2. `supabase.from("users").insert()` — creates user profile
3. If profile insert fails, auth user is rolled back (deleted)

---

## Security Notes

> ⚠️ **Current Implementation Gaps:**
> - `ProtectedRoute` component exists but is **not applied** to routes — all authenticated pages are technically accessible without login
> - Password is stored in Zustand state (for settings display) — this is a security concern
> - No role-based middleware on the backend — all API endpoints are accessible to any caller
> - CORS is configured as open (`app.use(cors())`)

### Recommended Improvements:
1. Wrap all staff routes with `ProtectedRoute` in the router
2. Add JWT middleware to backend routes
3. Implement role-based access control (RBAC) on the backend
4. Remove password storage from frontend state
5. Configure CORS with specific origins
