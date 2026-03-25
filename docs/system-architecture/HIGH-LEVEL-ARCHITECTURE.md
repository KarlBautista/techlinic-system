# TechClinic System Architecture — High-Level Overview
### Chapter 3: System Architecture

---

```mermaid
graph TD
    %% ============================================================
    %% PRESENTATION LAYER
    %% ============================================================
    subgraph PL["🖥️ PRESENTATION LAYER"]
        direction LR
        subgraph Users["Users"]
            Student["👨‍🎓 Student\n(Kiosk / Tablet)"]
            Nurse["👩‍⚕️ Nurse"]
            Doctor["👨‍⚕️ Doctor"]
        end
        subgraph FE["Frontend Application"]
            ReactApp["React 19 + Vite\nSingle Page Application\nPort: 5173"]
            StateM["Zustand\nState Management"]
            Router["React Router\nClient-Side Routing"]
        end
    end

    %% ============================================================
    %% APPLICATION LAYER
    %% ============================================================
    subgraph AL["⚙️ APPLICATION LAYER"]
        direction LR
        subgraph API["Express.js REST API Server — Port: 3500"]
            Routes["API Routes\n/api/*"]
            Controllers["Controllers\n(Business Logic)"]
            MW["Middleware\nAuth + RBAC"]
        end
    end

    %% ============================================================
    %% DATA LAYER
    %% ============================================================
    subgraph DL["🗄️ DATA LAYER"]
        direction LR
        subgraph SB["Supabase (Cloud)"]
            PG["PostgreSQL\nDatabase"]
            Auth["Supabase\nAuth Service"]
            RLS["Row Level\nSecurity (RLS)"]
            Storage["Supabase\nStorage"]
        end
    end

    %% ============================================================
    %% CONNECTIONS
    %% ============================================================
    Student -->|"Self-Registration\n(Public Page)"| ReactApp
    Nurse -->|"Staff Portal"| ReactApp
    Doctor -->|"Staff Portal"| ReactApp

    ReactApp --- StateM
    ReactApp --- Router

    ReactApp -->|"HTTP / REST\n(Axios)"| Routes
    Routes --> MW
    MW --> Controllers

    Controllers -->|"Supabase JS SDK\n(Queries)"| PG
    Controllers -->|"Admin SDK\n(User Creation)"| Auth

    ReactApp -.->|"Direct Auth\n(Login / Logout)"| Auth

    PG --- RLS
    Auth -.-> Storage

    %% ============================================================
    %% STYLING
    %% ============================================================
    classDef presLayer fill:#EBF5FB,stroke:#2980B9,stroke-width:3px,color:#1B4F72
    classDef appLayer fill:#EAFAF1,stroke:#27AE60,stroke-width:3px,color:#1E8449
    classDef dataLayer fill:#FEF9E7,stroke:#F39C12,stroke-width:3px,color:#7D6608

    classDef userNode fill:#D6EAF8,stroke:#2E86C1,stroke-width:2px,color:#1B4F72,rx:10
    classDef feNode fill:#AED6F1,stroke:#2980B9,stroke-width:2px,color:#1A5276,rx:8
    classDef apiNode fill:#A9DFBF,stroke:#27AE60,stroke-width:2px,color:#186A3B,rx:8
    classDef dbNode fill:#F9E79F,stroke:#F39C12,stroke-width:2px,color:#7D6608,rx:8

    class PL presLayer
    class AL appLayer
    class DL dataLayer

    class Student,Nurse,Doctor userNode
    class ReactApp,StateM,Router feNode
    class Routes,Controllers,MW apiNode
    class PG,Auth,RLS,Storage dbNode
```

---

## Architecture Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Presentation** | React 19, Vite, Tailwind CSS, Zustand, React Router | User interface for students, nurses, and doctors |
| **Application** | Node.js, Express.js v5, CORS, JWT Middleware | REST API server handling business logic and RBAC |
| **Data** | Supabase (PostgreSQL), Supabase Auth, RLS, Storage | Cloud-hosted database, authentication, and file storage |

### Communication Protocols
- **Frontend → Backend:** HTTP/REST via Axios (JSON)
- **Frontend → Supabase Auth:** Direct connection (login/logout only)
- **Backend → Database:** Supabase JS SDK (anon key for queries, service role key for admin operations)

### Color Legend
| Color | Layer |
|-------|-------|
| 🔵 Blue border | Presentation Layer (Client-side) |
| 🟢 Green border | Application Layer (Server-side) |
| 🟡 Amber/Orange border | Data Layer (Database & Cloud Services) |
