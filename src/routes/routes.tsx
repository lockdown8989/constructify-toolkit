import { createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Dashboard from "@/pages/Dashboard";
import People from "@/pages/People";
import EmployeeWorkflow from "@/pages/EmployeeWorkflow";
import LeaveManagement from "@/pages/LeaveManagement";
import Salary from "@/pages/Salary";
import Payroll from "@/pages/Payroll";
import Attendance from "@/pages/Attendance";
import RestaurantSchedule from "@/pages/RestaurantSchedule";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import TimeClock from "@/pages/TimeClock";
import ManagerTimeClock from "@/pages/ManagerTimeClock";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/auth",
    element: <Auth />,
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
    path: "/employee-workflow",
    element: (
      <ProtectedRoute>
        <EmployeeWorkflow />
      </ProtectedRoute>
    ),
  },
  {
    path: "/leave-management",
    element: (
      <ProtectedRoute>
        <LeaveManagement />
      </ProtectedRoute>
    ),
  },
  {
    path: "/salary",
    element: (
      <ProtectedRoute>
        <Salary />
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
    path: "/attendance",
    element: (
      <ProtectedRoute>
        <Attendance />
      </ProtectedRoute>
    ),
  },
  {
    path: "/shift-calendar",
    element: (
      <ProtectedRoute>
        <RestaurantSchedule />
      </ProtectedRoute>
    ),
  },
  {
    path: "/time-clock",
    element: (
      <ProtectedRoute>
        <TimeClock />
      </ProtectedRoute>
    ),
  },
    {
    path: "/manager-time-clock",
    element: (
      <ProtectedRoute>
        <ManagerTimeClock />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
