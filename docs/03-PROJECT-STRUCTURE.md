# 3. Project Structure

## Root Directory

```
Techclinic/
├── Backend/                          # Express.js API server
│   ├── index.js                      # Entry point - starts Express on port 3000
│   ├── package.json                  # Backend dependencies
│   ├── createUser.js                 # Utility script to create users
│   ├── config/
│   │   ├── supabaseClient.js         # Supabase client (anon key)
│   │   └── supabaseAdmin.js          # Supabase admin client (service role key)
│   ├── controllers/
│   │   ├── dataControllers.js        # Patient records & personnel CRUD
│   │   ├── medicineController.js     # Medicine inventory CRUD
│   │   ├── analyticsController.js    # Analytics data (charts)
│   │   ├── diseasesController.js     # Disease list & outbreak stats
│   │   └── notificationController.js # Notification alerts CRUD
│   └── routes/
│       ├── dataRoutes.js             # /api/insert-record, /api/get-records, etc.
│       ├── medicineRoutes.js         # /api/insert-medicine, /api/get-medicines, etc.
│       ├── analyticsRoutes.js        # /api/get-weekly-patients, etc.
│       ├── diseasesRoute.js          # /api/get-all-diseases, etc.
│       └── notificationRoutes.js     # /api/check-alerts, /api/user/:userId, etc.
│
└── frontend/
    └── techclinic/                   # React + Vite app
        ├── index.html                # HTML entry point
        ├── package.json              # Frontend dependencies
        ├── vite.config.js            # Vite configuration
        ├── tailwind.config.js        # Tailwind CSS configuration
        └── src/
            ├── App.jsx               # Root component - initializes data fetching
            ├── main.jsx              # React DOM render entry
            ├── index.css             # Global styles (Tailwind imports)
            ├── config/
            │   └── supabaseClient.js # Frontend Supabase client
            ├── router/
            │   └── router.jsx        # All route definitions
            ├── store/
            │   ├── useAuthStore.js    # Auth state (Zustand + persist)
            │   ├── useDataStore.js    # Patient data state (Zustand + persist)
            │   ├── useMedicineStore.js# Medicine state (Zustand)
            │   ├── useChartStore.js   # Chart/analytics state (Zustand)
            │   └── useNotificationStore.js # Notifications state (Zustand)
            ├── pages/
            │   ├── LandingPage.jsx    # Student self-registration (public)
            │   ├── Login.jsx          # Staff login page
            │   ├── newDashboard.jsx   # Main dashboard with stats
            │   ├── NewPatient.jsx     # Add new patient (nurse)
            │   ├── PatientRecord.jsx  # All patient records list
            │   ├── IndividualRecord.jsx # Single patient detail view
            │   ├── AddDiagnosis.jsx   # Add diagnosis (doctor)
            │   ├── MedicineInventory.jsx # (newMedicine.jsx) Medicine list
            │   ├── AddMedicine.jsx    # Add new medicine form
            │   ├── Analytics.jsx      # (newAnalytics.jsx) Charts page
            │   ├── Notifications.jsx  # Notifications page
            │   ├── PersonnelList.jsx  # Staff list
            │   ├── AddPersonnel.jsx   # Add staff form
            │   └── Settings.jsx       # User settings
            ├── charts/
            │   ├── PatientCountsChart.jsx       # Area chart - patient visits
            │   ├── PatientsPerDepartmentChart.jsx # Donut chart - by department  
            │   ├── TopDiagnosisChart.jsx         # Pareto + trend charts
            │   └── MedicinesChart.jsx            # Bar chart - low stock meds
            └── components/
                ├── newNavigation.jsx   # Current sidebar navigation
                ├── Navigation.jsx      # Legacy sidebar (unused)
                ├── ProtectedRoute.jsx  # Auth guard (defined but unused)
                ├── AnimateNumber.jsx   # Number animation component
                ├── CertificateModal.jsx# Medical certificate modal
                ├── PrescriptionModal.jsx # Prescription modal
                ├── MedicineForm.jsx    # Medicine edit/delete modal
                ├── Dropdown.jsx        # Custom dropdown select
                ├── registrationInfo.jsx# Floating label input
                └── FormatDate.js       # Date formatting utility
```

## Key Files Explained

| File | What It Does |
|------|-------------|
| `Backend/index.js` | Entry point - creates Express server, registers all route modules, listens on port 3000 |
| `Backend/config/supabaseClient.js` | Creates Supabase client with anon key (for regular queries) |
| `Backend/config/supabaseAdmin.js` | Creates Supabase client with service role key (for admin operations like creating users) |
| `frontend/techclinic/src/App.jsx` | Root React component - runs initial data fetching on mount (records, patients, medicines, users) |
| `frontend/techclinic/src/router/router.jsx` | Defines all 14 routes using react-router-dom's `createBrowserRouter` |
