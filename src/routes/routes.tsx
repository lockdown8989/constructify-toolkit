
import React from "react";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import People from "@/pages/People";
import Schedule from "@/pages/Schedule";
import ScheduleRequests from "@/pages/ScheduleRequests";
import EmployeeWorkflow from "@/pages/EmployeeWorkflow";
import Salary from "@/pages/Salary";
import Payroll from "@/pages/Payroll";
import LeaveManagement from "@/pages/LeaveManagement";
import Hiring from "@/pages/Hiring";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import AppLayout from "@/components/layout/AppLayout";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export function Router() {
  return [
    {
      path: "/auth",
      element: <Auth />
    },
    {
      element: <AppLayout />,
      children: [
        {
          path: "/",
          element: <Navigate to="/dashboard" replace />
        },
        {
          path: "/index",
          element: <Navigate to="/dashboard" replace />
        },
        {
          path: "/dashboard",
          element: <ProtectedRoute><Dashboard /></ProtectedRoute>
        },
        {
          path: "/people",
          element: <ProtectedRoute><People /></ProtectedRoute>
        },
        {
          path: "/schedule",
          element: <ProtectedRoute><Schedule /></ProtectedRoute>
        },
        {
          path: "/schedule-requests",
          element: <ProtectedRoute><ScheduleRequests /></ProtectedRoute>
        },
        {
          path: "/employee-workflow",
          element: <ProtectedRoute><EmployeeWorkflow /></ProtectedRoute>
        },
        {
          path: "/salary",
          element: <ProtectedRoute><Salary /></ProtectedRoute>
        },
        {
          path: "/payroll",
          element: <ProtectedRoute requiredRole="manager"><Payroll /></ProtectedRoute>
        },
        {
          path: "/leave-management",
          element: <ProtectedRoute><LeaveManagement /></ProtectedRoute>
        },
        {
          path: "/hiring",
          element: <ProtectedRoute><Hiring /></ProtectedRoute>
        },
        {
          path: "/profile",
          element: <ProtectedRoute><Profile /></ProtectedRoute>
        },
        {
          path: "*",
          element: <NotFound />
        }
      ]
    }
  ];
}
