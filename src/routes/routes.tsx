
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
        path: "people",
        element: <People />,
      },
      {
        path: "leave",
        element: <LeaveManagement />,
      },
      {
        path: "hiring",
        element: <Hiring />,
      },
      {
        path: "schedule",
        element: <Schedule />,
      },
      {
        path: "calendar",
        element: <Schedule />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "salary",
        element: <Salary />,
      },
      {
        path: "payroll",
        element: <PayslipPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
