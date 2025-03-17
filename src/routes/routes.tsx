import React, { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Payroll from "@/pages/Payroll";
import Projects from "@/pages/Projects";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Signin from "@/pages/Signin";
import Signup from "@/pages/Signup";
import Tasks from "@/pages/Tasks";
import People from "@/pages/People";
import EmployeeDetails from "@/pages/EmployeeDetails";

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
    path: "/employees",
    element: (
      <ProtectedRoute>
        <Employees />
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
    path: "/projects",
    element: (
      <ProtectedRoute>
        <Projects />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/tasks",
    element: (
      <ProtectedRoute>
        <Tasks />
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
    path: "/employee/:id",
    element: (
      <ProtectedRoute>
        <EmployeeDetails />
      </ProtectedRoute>
    ),
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
];

export default routes;
