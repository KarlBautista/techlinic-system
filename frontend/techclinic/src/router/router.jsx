import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/newDashboard";
import Login from "../pages/Login";
import NewPatient from "../pages/NewPatient";
import MedicineInventory from "../pages/newMedicine";
import PatientRecord from "../pages/PatientRecord";
import IndividualRecord from "../pages/IndividualRecord";
import AddMedicine from "../pages/AddMedicine";
import Analytics from "../pages/newAnalytics";
import Notifications from "../pages/Notifications";
import PersonnelList from "../pages/PersonnelList"
import Settings from "../pages/Settings";
import AddPersonnel from "../pages/AddPersonnel";
import AddDiagnosis from "../pages/AddDiagnosis";
import LandingPage from "../pages/LandingPage"
const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/new-patient", element: <NewPatient /> },
  { path: "/patient-record", element: <PatientRecord />},
  { path: "/medicine-inventory", element: <MedicineInventory /> },
  { path: "/individual-record/:studentId", element: <IndividualRecord /> },
  { path: "/add-medicine", element: <AddMedicine /> },
  { path: "/analytics", element: <Analytics /> },
  { path: "/notifications", element: <Notifications /> },
  { path: "/personnel-list", element: <PersonnelList />},
  { path: "/settings", element: <Settings /> },
  { path: "/add-personnel", element: <AddPersonnel />},
  { path: "/add-diagnosis/:recordId", element: <AddDiagnosis /> }
]);

export default router;