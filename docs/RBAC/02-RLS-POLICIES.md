# Supabase Row Level Security (RLS) Policies

> **Applied to:** Techclinic Supabase Project (`hvnfijudokbvnydzpvko`)  
> **Date:** February 17, 2026

This document contains the exact SQL that was applied to the Supabase database to enable Row Level Security and create role-based access policies.

---

## Helper Function

This function retrieves the currently authenticated user's role from the `public.users` table. It's called by many RLS policies.

```sql
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;
```

- `STABLE` — tells PostgreSQL the function doesn't modify the database
- `SECURITY DEFINER` — runs with the privileges of the function owner (bypasses RLS for this single lookup)
- `auth.uid()` — Supabase built-in that extracts the user ID from the JWT

---

## Enable RLS on All Tables

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
```

Once RLS is enabled, **no data is accessible by default** unless a policy explicitly allows it.

---

## Users Table Policies

```sql
-- Any authenticated user can view all user profiles
-- (needed for personnel list, attending physician display, etc.)
CREATE POLICY "users_select_authenticated" ON public.users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
-- (settings page, signature upload, etc.)
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Only DOCTOR can create new user accounts
-- (personnel management — adding new nurses/doctors)
CREATE POLICY "users_insert_doctor" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'DOCTOR');
```

**Why DOCTOR can insert users:** The personnel management feature (adding new nurses/doctors) is a doctor-only function. The actual auth.users entry is created via the service role key in the backend, but the public.users profile row needs this INSERT policy.

---

## Records Table Policies

```sql
-- Both roles can view all patient records
CREATE POLICY "records_select_authenticated" ON public.records
  FOR SELECT
  TO authenticated
  USING (true);

-- Only NURSE can create new records (patient intake)
CREATE POLICY "records_insert_nurse" ON public.records
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'NURSE');

-- Only DOCTOR can update records (e.g., setting status to COMPLETE after diagnosis)
CREATE POLICY "records_update_doctor" ON public.records
  FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'DOCTOR')
  WITH CHECK (public.get_user_role() = 'DOCTOR');
```

**Workflow:** NURSE creates the record → DOCTOR adds diagnosis and marks it COMPLETE.

---

## Patients Table Policies

```sql
-- Both roles can view patients
CREATE POLICY "patients_select_authenticated" ON public.patients
  FOR SELECT
  TO authenticated
  USING (true);

-- Only NURSE can create new patients (they handle intake)
CREATE POLICY "patients_insert_nurse" ON public.patients
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'NURSE');

-- Both roles can update patient information
CREATE POLICY "patients_update_authenticated" ON public.patients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

---

## Diagnoses Table Policies

```sql
-- Both roles can view diagnoses
CREATE POLICY "diagnoses_select_authenticated" ON public.diagnoses
  FOR SELECT
  TO authenticated
  USING (true);

-- Only DOCTOR can create diagnoses
CREATE POLICY "diagnoses_insert_doctor" ON public.diagnoses
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'DOCTOR');

-- Only DOCTOR can update diagnoses
CREATE POLICY "diagnoses_update_doctor" ON public.diagnoses
  FOR UPDATE
  TO authenticated
  USING (public.get_user_role() = 'DOCTOR')
  WITH CHECK (public.get_user_role() = 'DOCTOR');
```

**Key restriction:** A NURSE can **view** diagnosis information (to print certificates, etc.) but can **never create or modify** a diagnosis. Only a DOCTOR can diagnose.

---

## Medicines Table Policies

```sql
-- Both roles can view medicines
CREATE POLICY "medicines_select_authenticated" ON public.medicines
  FOR SELECT
  TO authenticated
  USING (true);

-- Both roles can add medicines
CREATE POLICY "medicines_insert_authenticated" ON public.medicines
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Both roles can update medicines (stock levels change during prescriptions)
CREATE POLICY "medicines_update_authenticated" ON public.medicines
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Both roles can delete medicines
CREATE POLICY "medicines_delete_authenticated" ON public.medicines
  FOR DELETE
  TO authenticated
  USING (true);
```

**Why both roles?** Both nurses and doctors need to manage the medicine inventory in a clinic setting.

---

## Diseases Table Policies

```sql
-- Both roles can view the disease catalog
CREATE POLICY "diseases_select_authenticated" ON public.diseases
  FOR SELECT
  TO authenticated
  USING (true);

-- Only DOCTOR can add new diseases to the catalog
CREATE POLICY "diseases_insert_doctor" ON public.diseases
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() = 'DOCTOR');
```

---

## Notifications Table Policies

```sql
-- Users can only see their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert notifications for any user
CREATE POLICY "notifications_insert_authenticated" ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can only update their own notifications (mark as read)
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own notifications
CREATE POLICY "notifications_delete_own" ON public.notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
```

**Privacy:** Notifications are scoped to the individual user. A doctor cannot see a nurse's notifications and vice versa.

---

## Verifying Policies

You can check all active policies with this SQL query in the Supabase SQL Editor:

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

---

## Important Notes

1. **Service Role Key bypasses RLS.** The backend's `supabaseAdmin` client (used for creating auth users) uses the service role key. This is intentional — the admin client needs to create users without being subject to RLS.

2. **Anon Key respects RLS.** The regular `supabase` client in the backend uses the anon key, so all queries through it are subject to RLS policies.

3. **`SECURITY DEFINER` on `get_user_role()`.** This is necessary because the function needs to read from the `users` table even during an INSERT operation (when the user might not have SELECT permission in some edge cases). SECURITY DEFINER makes it run with elevated privileges just for this one lookup.
