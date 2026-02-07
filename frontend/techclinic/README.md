# TechClinic System Documentation

> **TechClinic** is a web-based clinic management system designed for the Technological University of the Philippines (TUP). It streamlines patient registration, medical records management, medicine inventory tracking, analytics/reporting, personnel management, and disease alert notifications.

---

## Table of Contents

1. [System Overview](./01-SYSTEM-OVERVIEW.md)
2. [Tech Stack](./02-TECH-STACK.md)
3. [Project Structure](./03-PROJECT-STRUCTURE.md)
4. [Database Schema](./04-DATABASE-SCHEMA.md)
5. [API Reference](./05-API-REFERENCE.md)
6. [Frontend Architecture](./06-FRONTEND-ARCHITECTURE.md)
7. [State Management](./07-STATE-MANAGEMENT.md)
8. [Data Flow](./08-DATA-FLOW.md)
9. [Features Guide](./09-FEATURES-GUIDE.md)
10. [Authentication & Roles](./10-AUTH-AND-ROLES.md)
11. [Charts & Analytics](./11-CHARTS-AND-ANALYTICS.md)
12. [Notifications System](./12-NOTIFICATIONS.md)
13. [Setup & Running](./13-SETUP-AND-RUNNING.md)

---

## Quick Start

```bash
# Backend
cd Backend
npm install
node index.js          # Runs on http://localhost:3000

# Frontend
cd frontend/techclinic
npm install
npm run dev            # Runs on http://localhost:5173
```

## Environment Variables

### Backend (.env)
```
NODE_PROJECT_URL=<supabase-project-url>
NODE_API_KEY=<supabase-anon-key>
NODE_SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

### Frontend (.env)
```
VITE_PROJECT_URL=<supabase-project-url>
VITE_API_KEY=<supabase-anon-key>
```
