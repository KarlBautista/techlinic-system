import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/newDashboard";
import Login from "../pages/Login";
import NewPatient from "../pages/NewPatient";
import MedicineInventory from "../pages/newMedicine";
import PatientRecord from "../pages/PatientRecord";
import IndividualRecord from "../pages/IndividualRecord";
import AddMedicine from "../pages/AddMedicine";
import Notifications from "../pages/Notifications";
import PersonnelList from "../pages/PersonnelList"
import Settings from "../pages/Settings";
import AddDiagnosis from "../pages/AddDiagnosis";
import ActivityLog from "../pages/ActivityLog";
import LandingPage from "../pages/LandingPage"
import ForgotPassword from "../pages/ForgotPassword"
import ResetPassword from "../pages/ResetPassword"
import AccountActivation from "../pages/AccountActivation"
import DocumentView from "../pages/DocumentView"
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/AppLayout";

const router = createBrowserRouter([
  // ── Public routes ──
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password", element: <ResetPassword /> },
  { path: "/activate-account", element: <AccountActivation /> },
  { path: "/document/:id", element: <DocumentView /> },

  // ── Protected routes (with AppLayout — sidebar + content) ──
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/patient-record", element: <PatientRecord /> },
      { path: "/medicine-inventory", element: <MedicineInventory /> },
      { path: "/individual-record/:studentId", element: <IndividualRecord /> },
      { path: "/activity-log", element: <ActivityLog /> },
      { path: "/notifications", element: <Notifications /> },
      { path: "/settings", element: <Settings /> },
    ],
  },

  // ── DOCTOR and NURSE only (not ADMIN) ──
  {
    element: <ProtectedRoute allowedRoles={["DOCTOR", "NURSE"]}><AppLayout /></ProtectedRoute>,
    children: [
      { path: "/add-medicine", element: <AddMedicine /> },
      { path: "/new-patient", element: <NewPatient /> },
    ],
  },

  // ── DOCTOR & NURSE (with AppLayout) ──
  {
    element: <ProtectedRoute allowedRoles={["DOCTOR", "NURSE"]}><AppLayout /></ProtectedRoute>,
    children: [
      { path: "/add-diagnosis/:recordId", element: <AddDiagnosis /> },
    ],
  },

  // ── ADMIN only (with AppLayout) ──
  {
    element: <ProtectedRoute allowedRoles={["ADMIN"]}><AppLayout /></ProtectedRoute>,
    children: [
      { path: "/admin-dashboard", element: <Dashboard /> },
    ],
  },

  // ── ADMIN only: manage personnel ──
  {
    element: <ProtectedRoute allowedRoles={["ADMIN"]}><AppLayout /></ProtectedRoute>,
    children: [
      { path: "/personnel-list", element: <PersonnelList /> },
    ],
  },
]);

export default router;