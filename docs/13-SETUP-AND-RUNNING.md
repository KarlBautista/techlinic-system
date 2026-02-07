# 13. Setup & Running

## Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | v18 or later |
| npm | v9 or later |
| Supabase Account | [supabase.com](https://supabase.com) |

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/KarlBautista/techlinic-system.git
cd Techclinic
```

---

## Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Create the following tables in the Supabase SQL editor:

### Tables to Create:

```sql
-- Patients (unique student directory)
CREATE TABLE patients (
    student_id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    contact_number TEXT,
    year_level TEXT,
    department TEXT,
    sex TEXT,
    email TEXT,
    address TEXT,
    date_of_birth DATE
);

-- Records (clinic visit records)
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    student_id TEXT,
    contact_number TEXT,
    year_level TEXT,
    department TEXT,
    sex TEXT,
    email TEXT,
    address TEXT,
    date_of_birth DATE,
    attending_physician TEXT,
    status TEXT DEFAULT 'INCOMPLETE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Diseases (reference catalog)
CREATE TABLE diseases (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Diagnoses (medical diagnoses per visit)
CREATE TABLE diagnoses (
    id SERIAL PRIMARY KEY,
    record_id INTEGER REFERENCES records(id),
    student_id TEXT,
    disease_id INTEGER REFERENCES diseases(id),
    diagnosis TEXT,
    medication TEXT,
    quantity INTEGER,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medicines (inventory)
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    medicine_name TEXT,
    generic_name TEXT,
    brand TEXT,
    type TEXT,
    dosage TEXT,
    unit_of_measure TEXT,
    stock_level INTEGER DEFAULT 0,
    batch_number TEXT,
    expiry_date DATE
);

-- Users (clinic staff)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    address TEXT,
    date_of_birth DATE,
    role TEXT,
    sex TEXT
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

3. Get your Supabase credentials from **Settings → API**:
   - Project URL
   - Anon/public key
   - Service role key (for admin operations)

---

## Step 3: Set Up Backend

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` folder:

```env
NODE_PROJECT_URL=https://your-project.supabase.co
NODE_API_KEY=your-supabase-anon-key
NODE_SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

Start the backend:

```bash
# Development (with auto-restart)
npm run dev

# Production
node index.js
```

The backend runs on **http://localhost:3000**

---

## Step 4: Set Up Frontend

```bash
cd frontend/techclinic
npm install
```

Create a `.env` file in the `frontend/techclinic/` folder:

```env
VITE_PROJECT_URL=https://your-project.supabase.co
VITE_API_KEY=your-supabase-anon-key
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on **http://localhost:5173**

---

## Step 5: Create First User

Since the system uses Supabase Auth, you need to create the first user manually.

### Option A: Via Supabase Dashboard
1. Go to Supabase → Authentication → Users
2. Click "Add user" → enter email + password
3. Insert a matching row in the `users` table:
```sql
INSERT INTO users (id, first_name, last_name, email, role, sex)
VALUES ('uuid-from-auth', 'Admin', 'User', 'admin@tup.edu.ph', 'DOCTOR', 'Male');
```

### Option B: Via Add Personnel Page
1. First create an initial user via Supabase Dashboard (Option A)
2. Log in with that user
3. Navigate to `/add-personnel` to add more staff

---

## Running Both Servers

You need **two terminals** running simultaneously:

**Terminal 1 (Backend):**
```bash
cd Backend
node index.js
# Output: Techclinic System Listening to PORT 3000
```

**Terminal 2 (Frontend):**
```bash
cd frontend/techclinic
npm run dev
# Output: Local: http://localhost:5173/
```

---

## Build for Production

```bash
cd frontend/techclinic
npm run build
```

Output goes to `frontend/techclinic/dist/` — deploy this as a static site.

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| "Failed to fetch" errors | Make sure backend is running on port 3000 |
| Auth errors on login | Verify `.env` has correct Supabase credentials |
| Blank dashboard | Check browser console for API errors |
| Medicine stock not updating | Ensure medicine ID is correct in the request |
| Notifications not appearing | Check if disease cases meet all 3 threshold conditions |
| Charts not loading | Backend must be running — charts fetch from API on mount |
