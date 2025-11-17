import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import NewPatient from "../pages/NewPatient";
import MedicineInventory from "../pages/MedicineInventory";
import PatientRecord from "../pages/PatientRecord";
import IndividualRecord from "../pages/IndividualRecord";
import AddMedicine from "../pages/AddMedicine";
const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/new-patient", element: <NewPatient /> },
  { path: "/patient-record", element: <PatientRecord />},
  { path: "/medicine-inventory", element: <MedicineInventory /> },
  { path: "/individual-record/:patientId", element: <IndividualRecord /> },
  { path: "/add-medicine", element: <AddMedicine /> },
]);

export default router;