# 4. Database Schema

The system uses **Supabase** (hosted PostgreSQL). Below are the database tables inferred from the codebase.

---

## Tables

### `records` — Patient Visit Records

Each row represents a single clinic visit.

| Column                | Type      | Description                                |
|-----------------------|-----------|--------------------------------------------|
| `id`                  | UUID/Int  | Primary key (auto-generated)               |
| `first_name`          | Text      | Patient's first name                       |
| `last_name`           | Text      | Patient's last name                        |
| `student_id`          | Text      | Student ID number (11 characters)          |
| `contact_number`      | Text      | Phone number                               |
| `year_level`          | Text      | Year level (1st, 2nd, 3rd, 4th)            |
| `department`          | Text      | College department                         |
| `sex`                 | Text      | Male/Female                                |
| `email`               | Text      | Email address                              |
| `address`             | Text      | Home address                               |
| `date_of_birth`       | Date      | Date of birth                              |
| `attending_physician` | Text      | Name of the attending doctor               |
| `status`              | Text      | `INCOMPLETE` or `COMPLETE`                 |
| `created_at`          | Timestamp | Auto-generated timestamp                   |

**Relationships:** Has many `diagnoses` (joined via `records.id = diagnoses.record_id`)

---

### `patients` — Unique Patient Directory

Stores one entry per unique student (deduplication).

| Column           | Type      | Description                     |
|------------------|-----------|---------------------------------|
| `student_id`     | Text      | Primary key (unique constraint) |
| `first_name`     | Text      | Patient's first name            |
| `last_name`      | Text      | Patient's last name             |
| `contact_number` | Text      | Phone number                    |
| `year_level`     | Text      | Year level                      |
| `department`     | Text      | College department              |
| `sex`            | Text      | Male/Female                     |
| `email`          | Text      | Email address                   |
| `address`        | Text      | Home address                    |
| `date_of_birth`  | Date      | Date of birth                   |

> **Note:** When a student registers again, the insert into `patients` silently fails (duplicate key) — this is expected behavior.

---

### `diagnoses` — Medical Diagnoses

Each diagnosis is linked to a specific visit record.

| Column       | Type     | Description                           |
|--------------|----------|---------------------------------------|
| `id`         | UUID/Int | Primary key                           |
| `record_id`  | UUID/Int | Foreign key → `records.id`            |
| `student_id` | Text     | Student ID (denormalized)             |
| `disease_id` | Int      | Foreign key → `diseases.id`           |
| `diagnosis`  | Text     | Diagnosis name/description            |
| `medication` | Text     | Prescribed medicine name              |
| `quantity`   | Int      | Quantity of medicine prescribed        |
| `treatment`  | Text     | Treatment instructions                |
| `notes`      | Text     | Additional notes                      |
| `created_at` | Timestamp| Auto-generated                        |

---

### `diseases` — Disease Catalog

Reference table of all known diseases/conditions.

| Column | Type | Description            |
|--------|------|------------------------|
| `id`   | Int  | Primary key            |
| `name` | Text | Disease/condition name |

---

### `medicines` — Medicine Inventory

| Column          | Type      | Description                  |
|-----------------|-----------|------------------------------|
| `id`            | UUID/Int  | Primary key                  |
| `medicine_name` | Text      | Brand/commercial name        |
| `generic_name`  | Text      | Generic drug name            |
| `brand`         | Text      | Manufacturer brand           |
| `type`          | Text      | Medicine type/category       |
| `dosage`        | Text      | Dosage strength              |
| `unit_of_measure`| Text     | Unit (tablet, ml, etc.)      |
| `stock_level`   | Int       | Current stock quantity        |
| `batch_number`  | Text      | Batch/lot number             |
| `expiry_date`   | Date      | Expiration date              |

---

### `users` — Clinic Staff

| Column         | Type | Description                           |
|----------------|------|---------------------------------------|
| `id`           | UUID | Primary key (matches Supabase Auth ID)|
| `first_name`   | Text | Staff first name                      |
| `last_name`    | Text | Staff last name                       |
| `email`        | Text | Email (matches Supabase Auth)         |
| `address`      | Text | Home address                          |
| `date_of_birth`| Date | Date of birth                         |
| `role`         | Text | `NURSE` or `DOCTOR`                   |
| `sex`          | Text | Male/Female                           |

---

### `notifications` — Alert Notifications

| Column      | Type      | Description                           |
|-------------|-----------|---------------------------------------|
| `id`        | UUID/Int  | Primary key                           |
| `user_id`   | UUID      | Foreign key → `users.id`              |
| `title`     | Text      | Notification title                    |
| `message`   | Text      | Notification body text                |
| `is_read`   | Boolean   | Read/unread status (default: false)   |
| `metadata`  | JSON      | Extra data (disease_id, cases, etc.)  |
| `created_at`| Timestamp | Auto-generated                        |

---

## Entity Relationship Diagram

```
┌──────────┐       ┌───────────┐       ┌──────────┐
│ patients │       │  records  │       │diagnoses │
│──────────│       │───────────│       │──────────│
│student_id│◄──────│student_id │       │record_id │──────►records.id
│first_name│       │id (PK)    │◄──────│disease_id│──────►diseases.id
│last_name │       │status     │       │diagnosis │
│department│       │department │       │medication│
│...       │       │created_at │       │quantity  │
└──────────┘       └───────────┘       └──────────┘

┌──────────┐       ┌──────────────┐    ┌──────────┐
│ diseases │       │ medicines    │    │  users   │
│──────────│       │──────────────│    │──────────│
│id (PK)   │       │id (PK)       │    │id (PK)   │
│name      │       │medicine_name │    │first_name│
└──────────┘       │stock_level   │    │role      │
                   │expiry_date   │    └────┬─────┘
                   └──────────────┘         │
                                      ┌─────┴──────────┐
                                      │ notifications  │
                                      │────────────────│
                                      │user_id → users │
                                      │title           │
                                      │is_read         │
                                      └────────────────┘
```

## Departments (Enum Values)

The `department` field uses these values:
- College of Architecture and Fine Arts
- College of Science
- College of Liberal Arts
- College of Industrial Education
- College of Engineering
- College of Industrial Technology
