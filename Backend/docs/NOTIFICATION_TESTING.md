# Notification System — Testing Guide

## Overview

The Techclinic notification system automatically monitors disease trends and alerts all clinic personnel when a disease crosses a threshold. This document explains how the system works and how to test it.

---

## How Disease Alerts Work

| Parameter         | Value | Description                                     |
|-------------------|-------|-------------------------------------------------|
| MIN_POPULATION    | 10    | Minimum patients before alerts are evaluated     |
| MIN_CASES         | 5     | Minimum cases of a single disease to trigger     |
| ALERT_THRESHOLD   | 10%   | Disease must affect ≥10% of patient population   |

**Alert logic:** A notification is created when a disease has **≥ 5 cases** AND represents **≥ 10% of the total patient population** (with at least 10 patients registered).

**Deduplication:** The same disease alert will not be created more than once per hour.

---

## Test Script

**Location:** `Backend/test-notifications.js`

### Prerequisites

1. Backend server running on `http://localhost:3000`
2. Terminal open in the `Backend/` directory

### Commands

```bash
# Full test: seed data → trigger alerts → verify
node test-notifications.js full

# Individual steps
node test-notifications.js seed      # Insert test patients & diagnoses
node test-notifications.js check     # Trigger the alert check endpoint
node test-notifications.js cleanup   # Remove all test data
```

### What `full` Does

1. **Seeds 6 test patients** — pushes total population above the 10-patient minimum
2. **Seeds 6 Dengue Fever diagnoses** — creates enough cases (≥5, ≥10%) to trigger an alert
3. **Calls `/api/check-alerts`** — triggers the backend to evaluate disease statistics and create notifications
4. **Reports results** — shows patient count, case count, percentages, and created notifications

### Expected Output

```
=== SEEDING TEST DATA ===
Current patients: 7
Inserted/updated 6 test patients
Inserted 6 test records
Inserted 6 test diagnoses (all Dengue Fever)

--- Updated Counts ---
Total patients:   13 (threshold: 10)
Dengue cases:     6 (threshold: 5)
Dengue %:         46.2% (threshold: 10%)
Alert will trigger: YES

=== TRIGGERING ALERT CHECK ===
Status: SUCCESS
Message: Created 6 notifications
```

### Verification Steps

After running `node test-notifications.js full`:

1. **Sidebar badge** — A red notification count should appear on the bell icon in the sidebar
2. **Notifications page** — Navigate to Notifications. You should see:
   - Disease Alert: Dengue Fever (unread, amber warning icon)
   - Disease Alert: Pneumonia (if Pneumonia cases ≥ 5)
3. **Mark as read** — Click a notification to mark it as read (dot disappears, background changes)
4. **Delete** — Hover over a notification to reveal the trash icon
5. **Mark all read** / **Clear all** buttons should function in the header

### Cleanup

Always clean up after testing:

```bash
node test-notifications.js cleanup
```

This removes:
- All test patients (student IDs starting with `TEST-`)
- All test records (attending_physician = `TEST_SEED`)
- All test diagnoses (notes = `TEST_SEED`)
- All disease alert notifications

---

## Notification Types

The frontend categorizes notifications by title keywords and assigns icons:

| Title Contains       | Icon                   | Color  |
|---------------------|------------------------|--------|
| `disease`, `alert`  | Warning triangle       | Amber  |
| `stock`, `medicine` | Pills icon             | Rose   |
| `system`, `update`  | Info circle            | Blue   |
| Other               | Bell icon              | Gray   |

---

## Auto-Polling

The frontend polls the check-alerts endpoint every **30 seconds** from:
- `newNavigation.jsx` — sidebar (always active)
- `Notifications.jsx` — notifications page (when user is on that page)

Browser push notifications are shown when new unread notifications are detected.

---

## API Endpoints

| Method   | Route                            | Description                       |
|----------|----------------------------------|-----------------------------------|
| `POST`   | `/api/check-alerts`              | Evaluate diseases and create alerts |
| `GET`    | `/api/user/:userId`              | Get all notifications for a user  |
| `PATCH`  | `/api/:notificationId/read`      | Mark one notification as read     |
| `PATCH`  | `/api/user/:userId/read-all`     | Mark all as read                  |
| `DELETE` | `/api/:notificationId`           | Delete one notification           |
| `DELETE` | `/api/user/:userId/all`          | Delete all user notifications     |

---

## Database Schema

**Table:** `notifications`

| Column       | Type          | Notes                    |
|-------------|---------------|--------------------------|
| `id`        | uuid          | Primary key, auto-generated |
| `created_at`| timestamptz   | Auto-generated           |
| `user_id`   | uuid          | References `users.id`    |
| `title`     | text          | Notification title       |
| `message`   | text          | Notification body        |
| `is_read`   | boolean       | Read/unread status       |

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| No alerts created | Population < 10 | Add more patients or run `seed` |
| "Insufficient data" | Population < 10 | Same as above |
| Script errors | Backend not running | Start backend: `node index.js` |
| Duplicate alerts | Alert already created < 1 hour ago | Wait 1 hour or delete existing alerts |
| Notifications not showing | Frontend not polling | Refresh the page |
