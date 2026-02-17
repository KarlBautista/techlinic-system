# TechClinic RBAC (Role-Based Access Control) System

> **Date Implemented:** February 17, 2026  
> **Roles:** `DOCTOR`, `NURSE`  
> **Security Layers:** 3 (Supabase RLS → Backend Middleware → Frontend Route Guards)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture — 3-Layer Security Model](#architecture--3-layer-security-model)
3. [Role Definitions & Permissions](#role-definitions--permissions)
4. [Layer 1: Supabase RLS Policies (Database)](#layer-1-supabase-rls-policies-database)
5. [Layer 2: Backend Express Middleware](#layer-2-backend-express-middleware)
6. [Layer 3: Frontend Route Guards](#layer-3-frontend-route-guards)
7. [How Authentication Flows End-to-End](#how-authentication-flows-end-to-end)
8. [File Reference](#file-reference)
9. [Testing RBAC](#testing-rbac)
10. [Extending RBAC (Adding New Roles)](#extending-rbac-adding-new-roles)

---

## Overview

Previously, role-based access was implemented only as **frontend conditional rendering** — a `NURSE` wouldn't *see* certain buttons, but could still access restricted API endpoints or database rows by hitting URLs directly. This was **security theater**, not real access control.

The new system enforces RBAC at **three layers**:

| Layer | Where | What It Does |
|-------|-------|-------------|
| **Layer 1** | Supabase Database (RLS) | Blocks unauthorized SQL operations at the row level |
| **Layer 2** | Express Backend (Middleware) | Validates JWT tokens and checks role before running controller logic |
| **Layer 3** | React Frontend (Route Guards) | Prevents navigation to unauthorized pages + hides UI elements |

Even if someone bypasses the frontend entirely (e.g., using Postman or curl), Layers 1 and 2 will still block them.

---

## Architecture — 3-Layer Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: React Frontend                                   │   │
│  │  • ProtectedRoute with allowedRoles prop                   │   │
│  │  • Navigation conditionally renders links by role          │   │
│  │  • Unauthorized → redirect to /dashboard                   │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                          │ HTTP + Bearer Token (JWT)             │
└──────────────────────────┼──────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 2: Express Backend                                         │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  authenticate() middleware                                  │    │
│  │  • Extracts Bearer token from Authorization header          │    │
│  │  • Calls supabase.auth.getUser(token) to verify JWT        │    │
│  │  • Fetches user profile (with role) from public.users       │    │
│  │  • Attaches req.user, req.userProfile, req.userRole         │    │
│  └──────────────────────┬───────────────────────────────────┘    │
│  ┌──────────────────────▼───────────────────────────────────┐    │
│  │  authorize("DOCTOR") middleware                             │    │
│  │  • Checks req.userRole against allowed roles                │    │
│  │  • Returns 403 if role not permitted                        │    │
│  └──────────────────────┬───────────────────────────────────┘    │
│                          │                                        │
└──────────────────────────┼───────────────────────────────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 1: Supabase Database (RLS)                                 │
│  • Row Level Security enabled on all public tables                │
│  • Policies check auth.uid() and get_user_role()                  │
│  • Even service_role queries respect USING/WITH CHECK clauses     │
│  • Example: NURSE cannot INSERT into diagnoses table              │
└──────────────────────────────────────────────────────────────────┘
```

---

## Role Definitions & Permissions

### NURSE
| Action | Allowed | Endpoint / Table |
|--------|---------|-----------------|
| View dashboard, analytics | ✅ | GET all analytics endpoints |
| View patient records | ✅ | GET /get-records, /get-record/:id |
| **Create new patient records** | ✅ | POST /insert-record |
| View medicines | ✅ | GET /get-medicines |
| Add/update/delete medicines | ✅ | POST/PUT/DELETE medicine endpoints |
| View notifications | ✅ | GET /user/:userId |
| **Add diagnosis** | ❌ | PUT /insert-diagnosis |
| **Manage personnel** | ❌ | POST /insert-personnel |
| **Add new diseases** | ❌ | POST /add-disease |
| **Access personnel list page** | ❌ | /personnel-list route |
| **Access diagnosis page** | ❌ | /add-diagnosis/:id route |

### DOCTOR
| Action | Allowed | Endpoint / Table |
|--------|---------|-----------------|
| View dashboard, analytics | ✅ | GET all analytics endpoints |
| View patient records | ✅ | GET /get-records, /get-record/:id |
| Create new patient records | ❌ | POST /insert-record |
| View medicines | ✅ | GET /get-medicines |
| Add/update/delete medicines | ✅ | POST/PUT/DELETE medicine endpoints |
| View notifications | ✅ | GET /user/:userId |
| **Add diagnosis** | ✅ | PUT /insert-diagnosis |
| **Manage personnel** | ✅ | POST /insert-personnel |
| **Add new diseases** | ✅ | POST /add-disease |
| **Access personnel list page** | ✅ | /personnel-list route |
| **Access diagnosis page** | ✅ | /add-diagnosis/:id route |
| Access new patient page | ❌ | /new-patient route |

---

## Layer 1: Supabase RLS Policies (Database)

> See full SQL in [02-RLS-POLICIES.md](./02-RLS-POLICIES.md)

RLS (Row Level Security) is Supabase's built-in mechanism to enforce access control at the **database row level**. Even if your backend code has a bug, RLS ensures no unauthorized data escapes.

### Helper Function
```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;
```

This function is called in every RLS policy to get the current user's role.

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| **users** | All authenticated | DOCTOR only | Own row only | — |
| **records** | All authenticated | NURSE only | DOCTOR only | — |
| **patients** | All authenticated | NURSE only | All authenticated | — |
| **diagnoses** | All authenticated | DOCTOR only | DOCTOR only | — |
| **medicines** | All authenticated | All authenticated | All authenticated | All authenticated |
| **diseases** | All authenticated | DOCTOR only | — | — |
| **notifications** | Own only | All authenticated | Own only | Own only |

---

## Layer 2: Backend Express Middleware

> See full code in [Backend/middleware/auth.js](../../Backend/middleware/auth.js)

### `authenticate` Middleware
1. Extracts the JWT from the `Authorization: Bearer <token>` header
2. Calls `supabase.auth.getUser(token)` to verify the token with Supabase Auth
3. Fetches the user profile (including `role`) from the `public.users` table
4. Attaches `req.user`, `req.userProfile`, and `req.userRole` to the request

### `authorize(...allowedRoles)` Middleware Factory
1. Checks if `req.userRole` is in the list of allowed roles
2. Returns **403 Forbidden** with a descriptive error if the role doesn't match
3. Logs the denied access attempt for audit purposes

### Usage in Routes
```javascript
const { authenticate, authorize } = require("../middleware/auth");

// Both roles
router.get("/get-records", authenticate, authorize("DOCTOR", "NURSE"), getRecords);

// NURSE only
router.post("/insert-record", authenticate, authorize("NURSE"), insertRecord);

// DOCTOR only
router.put("/insert-diagnosis", authenticate, authorize("DOCTOR"), addDiagnosis);
```

---

## Layer 3: Frontend Route Guards

### ProtectedRoute Component
The `ProtectedRoute` component now accepts an optional `allowedRoles` prop:

```jsx
// Any authenticated user
<ProtectedRoute><Dashboard /></ProtectedRoute>

// NURSE only — redirects DOCTOR to /dashboard
<ProtectedRoute allowedRoles={["NURSE"]}><NewPatient /></ProtectedRoute>

// DOCTOR only — redirects NURSE to /dashboard
<ProtectedRoute allowedRoles={["DOCTOR"]}><PersonnelList /></ProtectedRoute>
```

If the user's role doesn't match, they are redirected to `/dashboard` with an `accessDenied` state.

### Authenticated API Client
All frontend stores now use `src/lib/api.js` instead of raw `axios`. This module:
1. Creates an axios instance with `baseURL: "http://localhost:3000/api"`
2. Automatically attaches the Supabase JWT to every request via an interceptor
3. Handles 401/403 responses globally

```javascript
import api from "../lib/api";
const response = await api.get("/get-records");  // JWT attached automatically
```

---

## How Authentication Flows End-to-End

```
1. User logs in via Supabase Auth (frontend)
   └→ supabase.auth.signInWithPassword({ email, password })
   └→ Supabase returns a JWT access_token + refresh_token

2. Frontend stores the session in sessionStorage
   └→ User profile (with role) is fetched from public.users table

3. User navigates to a protected page
   └→ ProtectedRoute checks authentication + role
   └→ If role doesn't match → redirect to /dashboard

4. Frontend makes an API call to backend
   └→ api.js interceptor gets the session token
   └→ Attaches it as: Authorization: Bearer <jwt_access_token>

5. Backend receives the request
   └→ authenticate() middleware verifies the JWT with Supabase
   └→ Fetches user profile from DB
   └→ authorize("DOCTOR") checks req.userRole
   └→ If unauthorized → returns 403 Forbidden

6. Backend queries Supabase (using anon key or user context)
   └→ RLS policies enforce row-level access
   └→ e.g., NURSE cannot INSERT into diagnoses table
```

---

## File Reference

| File | Description |
|------|-------------|
| `Backend/middleware/auth.js` | `authenticate` and `authorize` middleware |
| `Backend/routes/authRoutes.js` | `/api/auth/me` and `/api/auth/role` endpoints |
| `Backend/routes/dataRoutes.js` | Patient/record routes with RBAC middleware |
| `Backend/routes/medicineRoutes.js` | Medicine routes with RBAC middleware |
| `Backend/routes/analyticsRoutes.js` | Analytics routes with RBAC middleware |
| `Backend/routes/diseasesRoute.js` | Disease routes with RBAC middleware |
| `Backend/routes/notificationRoutes.js` | Notification routes with RBAC middleware |
| `Backend/index.js` | Server entry point (registers auth routes) |
| `frontend/.../lib/api.js` | Axios instance with JWT interceptor |
| `frontend/.../components/ProtectedRoute.jsx` | Route guard with `allowedRoles` prop |
| `frontend/.../router/router.jsx` | Route definitions with role restrictions |

---

## Testing RBAC

### Quick Test: Backend Middleware
```bash
# 1. Login as a NURSE and get the access token
# 2. Try to access a DOCTOR-only endpoint:

curl -X PUT http://localhost:3000/api/insert-diagnosis \
  -H "Authorization: Bearer <NURSE_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"patientInput": {...}}'

# Expected: 403 Forbidden
# { "success": false, "error": "Access denied. Required role: DOCTOR. Your role: NURSE" }
```

### Quick Test: Frontend Route Guard
1. Login as a NURSE
2. Try navigating to `http://localhost:5173/personnel-list`
3. Expected: Redirect to `/dashboard`

### Quick Test: Supabase RLS
1. Login as a NURSE user in Supabase dashboard
2. Try inserting into the `diagnoses` table
3. Expected: Row-level security policy violation error

---

## Extending RBAC (Adding New Roles)

To add a new role (e.g., `ADMIN`):

### 1. Add the role to the database
```sql
UPDATE public.users SET role = 'ADMIN' WHERE email = 'admin@techclinic.com';
```

### 2. Update RLS policies
```sql
CREATE POLICY "users_delete_admin" ON public.users
  FOR DELETE TO authenticated
  USING (public.get_user_role() = 'ADMIN');
```

### 3. Update backend middleware
```javascript
router.delete("/delete-user/:userId", authenticate, authorize("ADMIN"), deleteUser);
```

### 4. Update frontend router
```jsx
{ path: "/admin", element: <ProtectedRoute allowedRoles={["ADMIN"]}><AdminPanel /></ProtectedRoute> }
```

### 5. Update navigation
Add the new role's navigation links in `newNavigation.jsx`.

---

*This RBAC system provides defense-in-depth security. Even if one layer is bypassed, the other two layers will still protect your data.*
