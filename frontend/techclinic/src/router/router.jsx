import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import NewPatient from "../pages/NewPatient";
import MedicineInventory from "../pages/MedicineInventory";
import PatientRecord from "../pages/PatientRecord";

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/new-patient", element: <NewPatient /> },
  { path: "/patient-record", element: <PatientRecord />},
  { path: "/medicine-inventory", element: <MedicineInventory />}
]);

export default router;