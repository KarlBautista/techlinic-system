# 1. System Overview

## What is TechClinic?

TechClinic is a clinic management system for TUP (Technological University of the Philippines). It allows **students to self-register** when they visit the clinic, and **clinic staff (nurses and doctors)** to manage patient records, diagnoses, medicine inventory, and view analytics.

---

## How It Works (High-Level Flow)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Student    │     │    Nurse     │     │     Doctor      │     │   Database   │
│ (Landing Pg) │────▶│ (Dashboard)  │────▶│  (Add Diagnosis)│────▶│  (Supabase)  │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────────┘
```

### Step-by-Step Flow:

1. **Student Visits Clinic** → Opens the landing page (`/`) on a kiosk/tablet
2. **Student Self-Registers** → Fills in personal info (name, student ID, department, etc.)
3. **Record Created** → A new record is created with status `INCOMPLETE` (no diagnosis yet)
4. **Nurse Reviews** → Nurse sees new records on the dashboard, can add a new patient via `/new-patient`
5. **Doctor Diagnoses** → Doctor clicks an incomplete record and adds diagnosis, medication, treatment
6. **Record Completed** → Status changes to `COMPLETE`
7. **Certificates/Prescriptions** → Staff can generate printable medical certificates and prescriptions

---

## User Roles

| Role     | Access                                                             |
|----------|--------------------------------------------------------------------|
| **NURSE**  | Dashboard, New Patient, Patient Records, Medicine Inventory, Analytics, Notifications, Settings |
| **DOCTOR** | Dashboard, Patient Records (+ Add Diagnosis), Medicine Inventory, Analytics, Notifications, Personnel List, Settings |

---

## Key Features at a Glance

| Feature                | Description                                                    |
|------------------------|----------------------------------------------------------------|
| Patient Self-Registration | Students register themselves at the landing page kiosk       |
| Patient Records        | View, search, and filter all patient visit records             |
| Diagnosis Management   | Doctors add diagnoses to incomplete records                     |
| Medicine Inventory     | Full CRUD for medicines with stock tracking                    |
| Analytics Dashboard    | Charts for patient counts, department breakdown, top diagnoses |
| Notifications          | Disease outbreak alerts when case thresholds are exceeded      |
| Personnel Management   | Add/view clinic staff (doctors and nurses)                     |
| Medical Certificates   | Generate printable clinic passes and certificates              |
| Prescriptions          | Generate printable prescriptions with email option             |
