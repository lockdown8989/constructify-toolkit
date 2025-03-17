
import React, { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Dashboard from "@/pages/Dashboard";
import People from "@/pages/People";
import Payroll from "@/pages/Payroll";
import LeaveManagement from "@/pages/LeaveManagement";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

const EmployeesManagement = lazy(() => import("@/pages/EmployeesManagement"));

const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/people",
    element: (
      <ProtectedRoute>
        <People />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payroll",
    element: (
      <ProtectedRoute>
        <Payroll />
      </ProtectedRoute>
    ),
  },
  {
    path: "/leave",
    element: (
      <ProtectedRoute>
        <LeaveManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/employees-management",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<div>Loading...</div>}>
          <EmployeesManagement />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  }
];

export default routes;
