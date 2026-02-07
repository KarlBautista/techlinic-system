# 2. Tech Stack

## Backend

| Technology      | Purpose                          | Version   |
|-----------------|----------------------------------|-----------|
| **Node.js**     | Runtime environment              | —         |
| **Express.js**  | Web framework / REST API server  | v5.1.0    |
| **Supabase JS** | Database client (PostgreSQL)     | v2.80.0   |
| **Moment.js**   | Date/time manipulation           | v2.30.1   |
| **CORS**        | Cross-origin resource sharing    | v2.8.5    |
| **dotenv**      | Environment variables            | v17.2.3   |
| **Nodemon**     | Auto-restart dev server          | v3.1.10   |

### Backend Architecture
- **Pattern:** MVC (Model-View-Controller) without explicit models
- **Database:** Supabase (hosted PostgreSQL)
- **Auth:** Supabase Auth (server-side admin for user creation)
- **Port:** 3000

---

## Frontend

| Technology         | Purpose                          | Version    |
|--------------------|----------------------------------|------------|
| **React**          | UI library                       | v19.2.0    |
| **Vite (Rolldown)**| Build tool / dev server          | v7.1.14    |
| **React Router**   | Client-side routing              | v7.9.5     |
| **Zustand**        | State management                 | v5.0.8     |
| **Tailwind CSS**   | Utility-first CSS framework      | v4.1.17    |
| **ApexCharts**     | Data visualization / charts      | v5.3.6     |
| **Supabase JS**    | Auth (client-side)               | v2.80.0    |
| **Axios**          | HTTP client                      | v1.13.2    |
| **Lucide React**   | Icon library                     | v0.554.0   |
| **SweetAlert2**    | Alert/confirmation dialogs       | v11.26.3   |
| **Tanstack Table** | Table management                 | v8.21.3    |

### Frontend Architecture  
- **Pattern:** Component-based with Zustand stores
- **Styling:** Tailwind CSS (utility classes)
- **Port:** 5173 (Vite dev server)

---

## Database (Supabase)

| Feature         | Usage                                         |
|-----------------|-----------------------------------------------|
| **PostgreSQL**  | All data storage (records, patients, etc.)     |
| **Auth**        | User authentication (email/password)           |
| **Realtime**    | Not currently used                             |
| **Storage**     | Not currently used                             |

---

## Communication Flow

```
┌───────────┐     HTTP (Axios)     ┌───────────┐    Supabase JS    ┌──────────┐
│  Frontend │ ──────────────────▶  │  Backend  │ ────────────────▶ │ Supabase │
│ (React)   │   localhost:3000     │ (Express) │                   │ (Postgres│
│ port:5173 │ ◀────────────────── │ port:3000 │ ◀──────────────── │ + Auth)  │
└───────────┘     JSON Response    └───────────┘    Query Results   └──────────┘
       │                                                                 │
       └─────────────── Supabase Auth (direct) ─────────────────────────┘
```

> **Note:** The frontend connects to Supabase directly for **authentication only** (sign in, sign out, auth state). All data operations go through the Express backend.
