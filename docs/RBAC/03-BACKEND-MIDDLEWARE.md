# Backend Middleware — Authentication & Authorization

> **File:** `Backend/middleware/auth.js`

This document explains how the backend Express middleware enforces RBAC.

---

## Overview

The middleware consists of two functions:

| Function | Purpose |
|----------|---------|
| `authenticate` | Verifies the JWT token and attaches user info to the request |
| `authorize(...roles)` | Checks if the user's role is in the allowed list |

They are always used together in this order:

```javascript
router.get("/endpoint", authenticate, authorize("DOCTOR", "NURSE"), handler);
//                       ^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^
//                       Step 1        Step 2                        Step 3
```

---

## `authenticate` — How It Works

### Step-by-Step

1. **Extract token** from the `Authorization` header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Verify with Supabase Auth** — calls `supabase.auth.getUser(token)` which:
   - Validates the JWT signature
   - Checks expiration
   - Returns the auth user object if valid

3. **Fetch user profile** from `public.users` table (using the admin client):
   - Gets `id`, `first_name`, `last_name`, `email`, `role`, etc.
   - This is the **server-authoritative** source of the role (not the frontend)

4. **Attach to request object**:
   ```javascript
   req.user = authUser;           // Supabase auth user (id, email, etc.)
   req.userProfile = userProfile; // DB profile (id, role, first_name, etc.)
   req.userRole = userProfile.role; // Convenience: "DOCTOR" or "NURSE"
   ```

### Error Responses

| Status | When |
|--------|------|
| `401 Unauthorized` | Missing Authorization header, invalid token, or expired token |
| `403 Forbidden` | User exists in auth but has no profile in `public.users`, or has no role assigned |
| `500 Internal Server Error` | Unexpected server-side error |

---

## `authorize(...allowedRoles)` — How It Works

This is a **middleware factory** — it returns a new middleware function configured with the allowed roles.

```javascript
// Creates a middleware that only allows DOCTOR
const doctorOnly = authorize("DOCTOR");

// Creates a middleware that allows both
const bothRoles = authorize("DOCTOR", "NURSE");
```

### Logic
1. Check `req.userRole` (set by `authenticate`)
2. If the role is in `allowedRoles` → call `next()` (proceed to handler)
3. If not → return `403 Forbidden` with a descriptive error message
4. Log the denied attempt for audit

### Error Response Example
```json
{
  "success": false,
  "error": "Access denied. Required role: DOCTOR. Your role: NURSE"
}
```

---

## Route Protection Summary

### Data Routes (`Backend/routes/dataRoutes.js`)

| Endpoint | Method | Allowed Roles | Reason |
|----------|--------|---------------|--------|
| `/get-records` | GET | DOCTOR, NURSE | Both need to view records |
| `/get-record/:studentId` | GET | DOCTOR, NURSE | Both need to view individual records |
| `/get-records-from-existing-patients/:studentId` | GET | DOCTOR, NURSE | Lookup existing patients |
| `/get-patients` | GET | DOCTOR, NURSE | Both need the patient list |
| `/get-all-users` | GET | DOCTOR, NURSE | Needed for personnel display |
| `/insert-record` | POST | **NURSE** | Only nurses do patient intake |
| `/get-record-to-diagnose/:recordId` | GET | **DOCTOR** | Only doctors diagnose |
| `/insert-diagnosis` | PUT | **DOCTOR** | Only doctors create diagnoses |
| `/insert-personnel` | POST | **DOCTOR** | Only doctors manage personnel |

### Medicine Routes (`Backend/routes/medicineRoutes.js`)

| Endpoint | Method | Allowed Roles |
|----------|--------|---------------|
| `/get-medicines` | GET | DOCTOR, NURSE |
| `/insert-medicine` | POST | DOCTOR, NURSE |
| `/update-medicine` | PUT | DOCTOR, NURSE |
| `/delete-medicine/:id` | DELETE | DOCTOR, NURSE |

### Analytics Routes (`Backend/routes/analyticsRoutes.js`)

All analytics endpoints allow both DOCTOR and NURSE (read-only dashboards).

### Disease Routes (`Backend/routes/diseasesRoute.js`)

| Endpoint | Method | Allowed Roles |
|----------|--------|---------------|
| `/get-all-diseases` | GET | DOCTOR, NURSE |
| `/get-all-number-of-diseases` | GET | DOCTOR, NURSE |
| `/add-disease` | POST | **DOCTOR** |

### Notification Routes (`Backend/routes/notificationRoutes.js`)

All notification endpoints allow both DOCTOR and NURSE.

### Auth Routes (`Backend/routes/authRoutes.js`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/me` | GET | Returns full user profile (for session verification) |
| `/auth/role` | GET | Returns only the user's role (lightweight check) |

Both require authentication but allow any role.

---

## What Happens When a Request Is Made

```
Frontend: api.get("/get-records")
  │
  ├── api.js interceptor adds: Authorization: Bearer <jwt>
  │
  └── HTTP Request → Backend
        │
        ├── authenticate() runs first
        │     ├── Extracts token ✓
        │     ├── Verifies with Supabase ✓
        │     ├── Fetches profile from DB ✓
        │     └── Sets req.userRole = "NURSE" ✓
        │
        ├── authorize("DOCTOR", "NURSE") runs next
        │     └── "NURSE" is in ["DOCTOR", "NURSE"] ✓
        │
        └── getRecords() controller runs
              └── Queries Supabase → RLS policy allows SELECT ✓
              └── Returns data
```

### Blocked Request Example
```
Frontend: api.put("/insert-diagnosis", { ... })
  │
  ├── User is logged in as NURSE
  │
  └── HTTP Request → Backend
        │
        ├── authenticate() ✓ (NURSE is authenticated)
        │
        ├── authorize("DOCTOR") ✗
        │     └── "NURSE" is NOT in ["DOCTOR"]
        │     └── Returns 403: "Access denied. Required role: DOCTOR. Your role: NURSE"
        │
        └── addDiagnosis() controller NEVER RUNS
```
