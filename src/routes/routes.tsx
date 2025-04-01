import React from "react";
import {
  createBrowserRouter,
} from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Index from "@/pages/Index";
import People from "@/pages/People";
import Schedule from "@/pages/Schedule";
import Hiring from "@/pages/Hiring";
import Payroll from "@/pages/Payroll";
import Salary from "@/pages/Salary";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import LeaveManagement from "@/pages/LeaveManagement";
import ScheduleRequests from "@/pages/ScheduleRequests";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "people",
        element: <People />,
      },
      {
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "schedule-requests",
        element: <ScheduleRequests />,
      },
      {
        path: "hiring",
        element: <Hiring />,
      },
      {
        path: "payroll",
        element: <Payroll />,
      },
      {
        path: "salary",
        element: <Salary />,
      },
      {
        path: "leave",
        element: <LeaveManagement />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
