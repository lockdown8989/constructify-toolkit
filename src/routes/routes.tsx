
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import People from "@/pages/People";
import LeaveManagement from "@/pages/LeaveManagement";
import Schedule from "@/pages/Schedule";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import PayslipPage from "@/pages/Payroll";
import Salary from "@/pages/Salary";
import Hiring from "@/pages/Hiring";

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
        // People management requires manager access
        path: "people",
        element: (
          <ProtectedRoute requiredRole="manager">
            <People />
          </ProtectedRoute>
        ),
      },
      {
        // Leave management requires manager access for approval
        path: "leave",
        element: (
          <ProtectedRoute requiredRole="manager">
            <LeaveManagement />
          </ProtectedRoute>
        ),
      },
      {
        // Hiring requires manager or HR access
        path: "hiring",
        element: (
          <ProtectedRoute requiredRole="manager">
            <Hiring />
          </ProtectedRoute>
        ),
      },
      {
        // Schedule can be viewed by everyone but only edited by managers
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "calendar",
        element: <Schedule />,
      },
      {
        // Profile is accessible to all authenticated users
        path: "profile",
        element: <Profile />,
      },
      {
        // Salary management requires manager access
        path: "salary",
        element: (
          <ProtectedRoute requiredRole="manager">
            <Salary />
          </ProtectedRoute>
        ),
      },
      {
        // Payslip viewing requires manager access
        path: "payroll",
        element: (
          <ProtectedRoute requiredRole="manager">
            <PayslipPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
