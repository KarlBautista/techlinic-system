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
import AddDiagnosis from "../pages/AddDiagnosis";
import LandingPage from "../pages/LandingPage"
import ProtectedRoute from "../components/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: "/new-patient", element: <ProtectedRoute><NewPatient /></ProtectedRoute> },
  { path: "/patient-record", element: <ProtectedRoute><PatientRecord /></ProtectedRoute> },
  { path: "/medicine-inventory", element: <ProtectedRoute><MedicineInventory /></ProtectedRoute> },
  { path: "/individual-record/:studentId", element: <ProtectedRoute><IndividualRecord /></ProtectedRoute> },
  { path: "/add-medicine", element: <ProtectedRoute><AddMedicine /></ProtectedRoute> },
  { path: "/analytics", element: <ProtectedRoute><Analytics /></ProtectedRoute> },
  { path: "/notifications", element: <ProtectedRoute><Notifications /></ProtectedRoute> },
  { path: "/personnel-list", element: <ProtectedRoute><PersonnelList /></ProtectedRoute> },
  { path: "/settings", element: <ProtectedRoute><Settings /></ProtectedRoute> },
  { path: "/add-diagnosis/:recordId", element: <ProtectedRoute><AddDiagnosis /></ProtectedRoute> }
]);

export default router;