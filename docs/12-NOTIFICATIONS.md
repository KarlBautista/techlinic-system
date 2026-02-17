# 12. Notifications System

The notification system monitors disease statistics **and medicine stock levels**, alerting clinic staff when potential outbreaks are detected or medicines are running low.

---

## How It Works

### Polling Architecture
```
┌─────────────────────────────────────────────┐
│ Frontend (every 30 seconds)                  │
│                                              │
│ newNavigation.jsx                            │
│   setInterval(30000) ─────────────────┐      │
│                                       │      │
│ Notifications.jsx                     │      │
│   setInterval(30000) ─────────────────┤      │
│                                       ▼      │
│                              POST /api/check-alerts
│                              GET  /api/user/:userId
└──────────────────────────────────────────────┘
```

Both the navigation sidebar and the notifications page poll for alerts independently.

---

## Alert Trigger Logic

An alert is triggered for a disease when **all** conditions are met:

| Condition | Threshold | Purpose |
|-----------|----------|---------|
| Total patients in system | ≥ 10 | Ensures population is meaningful |
| Cases of specific disease | ≥ 5 | Minimum case count |
| Disease percentage | ≥ 10% | Percentage of total population |

### Formula:
```
percentage = (disease_cases / total_patients) × 100

alert = (total_patients >= 10) AND (disease_cases >= 5) AND (percentage >= 10%)
```

### Example:
```
Total patients: 100
Common Cold cases: 12
Percentage: 12%

→ 100 >= 10 ✅
→ 12 >= 5 ✅  
→ 12% >= 10% ✅
→ ALERT TRIGGERED! 🚨
```

---

## Alert Creation Process

```
POST /api/check-alerts

Step 1: Count all diagnosis records per disease
        SELECT disease_id FROM diagnoses → group & count

Step 2: Get total patient population
        SELECT COUNT(*) FROM patients

Step 3: Calculate percentage for each disease
        For each disease: (count / population) × 100

Step 4: Filter diseases that exceed ALL thresholds
        → alertDiseases = diseases where alert = true

Step 5: Deduplication check
        For each alert disease:
        → Check if notification with same title exists in last 1 hour
        → Skip if already notified

Step 6: Create notifications for ALL users
        For each alert disease × each user:
        → INSERT INTO notifications (user_id, title, message)

Step 7: Check low stock medicines
        SELECT * FROM medicines WHERE stock_level <= 10

Step 8: Create low stock notifications for ALL users
        For each low-stock medicine × each user:
        → Dedup check (same title within 1 hour)
        → INSERT INTO notifications

Result: Every user gets notified about every disease alert AND low stock medicine
```

---

## Notification Object

```json
{
  "id": 1,
  "user_id": "uuid-of-user",
  "title": "⚠️ Disease Alert: Common Cold",
  "message": "12 cases detected (12% of population). Immediate attention required.",
  "is_read": false,
  "metadata": {
    "disease_id": 3,
    "total_cases": 12,
    "percentage": 12,
    "status": "ALERT",
    "created_timestamp": "2026-02-07T10:00:00.000Z"
  },
  "created_at": "2026-02-07T10:00:00.000Z"
}
```

---

## Frontend Notification Features

### `_isFetching` Guard
The `useNotificationStore` uses an `_isFetching` boolean flag to prevent concurrent polling calls from overlapping:
```js
_isFetching: false,

fetchNotifications: async (userId) => {
    if (get()._isFetching) return; // Prevent concurrent fetches
    set({ _isFetching: true, ... });
    // ... fetch logic ...
    set({ _isFetching: false });
}
```
This prevents race conditions when both the Navigation sidebar and Notifications page polling are active.

### Navigation Badge
- Red badge on the bell icon in the sidebar
- Shows count of unread notifications
- Updates every 30 seconds

### Redesigned Notifications Page
The notifications page (`Notifications.jsx`) has a modern card-based UI:

- **Header:** Page title with unread count + "Mark all read" / "Clear all" action buttons
- **Notification cards:** Each card includes:
  - Context-aware icon + color based on notification title:
    - Disease/alert → amber (`fa-triangle-exclamation`)
    - Stock/medicine/inventory → rose (`fa-pills`)
    - System/update → blue (`fa-circle-info`)
    - Default → gray (`fa-bell`)
  - Unread indicator: colored dot + bolder text  
  - Relative timestamp ("3m ago", "2h ago", "5d ago")
  - Hover-to-reveal delete button
- **Empty state:** Bell-slash icon + "No notifications" message
- **Click-to-read:** Clicking an unread notification auto-marks it as read
- Emoji stripping: Titles are cleaned of emojis (`cleanTitle()`) for consistent display

### Actions
| Action | API Call | Effect |
|--------|---------|--------|
| View notifications | `GET /api/user/:userId` | List sorted by date (newest first) |
| Click unread notification | `PATCH /api/:id/read` | Auto-marks as read |
| Mark all as read | `PATCH /api/user/:userId/read-all` | All unread → read |
| Delete one | `DELETE /api/:id` | SweetAlert confirmation → removes |
| Delete all | `DELETE /api/user/:userId/all` | SweetAlert confirmation → removes all |

### Time Display
Notifications show relative time:
- "just now" (< 1 minute)
- "5 minutes ago"
- "2 hours ago"
- "3 days ago"
- "1 week ago"
- etc.

### Browser Push Notifications
```
On mount:
1. requestNotificationPermission() 
   → Asks user to allow browser notifications

When new alert detected:
2. showBrowserNotification(title, { body: message })
   → Shows system-level notification outside the browser
```

---

## Notification Lifecycle

```
Disease cases exceed threshold
         │
         ▼
Backend creates notification  ──────►  Stored in "notifications" table
(1 per user per disease)                  is_read = false
         │
         ▼
Frontend polls every 30s
         │
         ▼
Shows in Navigation badge
(unread count) + Browser notification
         │
         ▼
User clicks bell → /notifications
         │
         ├──► Read notification → mark as read
         │
         └──► Delete notification → remove from DB

Next check (30s later):
  Same alert? → Skipped (deduplication: 1 hour window)
  New alert?  → New notification created
```

---

## Testing

### Test Script: `Backend/test-notifications.js`

A utility script to seed test data and manually trigger the alert system.

**Usage:**
```bash
node test-notifications.js seed      # Seed test patients + low-stock medicines
node test-notifications.js check     # Trigger POST /api/check-alerts manually
node test-notifications.js cleanup   # Remove all seeded test data
node test-notifications.js full      # Seed → Check → verify (no cleanup)
```

**Test data includes:**
- 6 test patients (to reach `MIN_POPULATION ≥ 10` with existing data)
- 3 test medicines with low stock (stock levels: 3, 0, 8)
- Test records with a disease linked to enough cases to trigger outbreak alerts

Test data is tagged with `TEST_SEED` for easy identification and cleanup.
