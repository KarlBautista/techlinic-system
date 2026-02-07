# 12. Notifications System

The notification system monitors disease statistics and alerts clinic staff when potential outbreaks are detected.

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
        → INSERT INTO notifications (user_id, title, message, metadata)

Result: Every user gets notified about every disease alert
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

### Navigation Badge
- Red badge on the bell icon in the sidebar
- Shows count of unread notifications
- Updates every 30 seconds

### Notifications Page
| Action | API Call | Effect |
|--------|---------|--------|
| View notifications | `GET /api/user/:userId` | List sorted by date (newest first) |
| Mark one as read | `PATCH /api/:id/read` | Changes `is_read` to true |
| Mark all as read | `PATCH /api/user/:userId/read-all` | All unread → read |
| Delete one | `DELETE /api/:id` | Removes with SweetAlert confirmation |
| Delete all | `DELETE /api/user/:userId/all` | Removes all with confirmation |

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
