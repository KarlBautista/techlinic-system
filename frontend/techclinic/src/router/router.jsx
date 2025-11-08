import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Navigation from "../pages/Navigation";

const DashboardWithNav = () => (
  <div className="flex h-full w-full gap-2">
    <Navigation />
    <Dashboard />
  </div>
);

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/dashboard", element: <DashboardWithNav /> },
]);

export default router;