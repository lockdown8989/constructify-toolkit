
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Auth from "../pages/Auth";
import Dashboard from "../pages/Dashboard";
import People from "../pages/People";
import Profile from "../pages/Profile";
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import LeaveManagement from "../pages/LeaveManagement";
import Schedule from "../pages/Schedule";
import Payroll from "../pages/Payroll";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "people",
        element: (
          <ProtectedRoute>
            <People />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "leave",
        element: (
          <ProtectedRoute>
            <LeaveManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "schedule",
        element: (
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        ),
      },
      {
        path: "payroll",
        element: (
          <ProtectedRoute requiredRole="admin">
            <Payroll />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default router;
