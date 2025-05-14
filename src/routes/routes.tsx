import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import LeaveManagement from "@/pages/LeaveManagement";
import Payroll from "@/pages/Payroll";
import Salary from "@/pages/Salary";
import People from "@/pages/People";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ProfileSettings from "@/pages/ProfileSettings";
import Attendance from "@/pages/Attendance";
import TimeClock from "@/pages/TimeClock";
import RestaurantSchedule from "@/pages/RestaurantSchedule";
import NotFound from "@/pages/NotFound";
import Hiring from "@/pages/Hiring";
import ScheduleRequests from "@/pages/ScheduleRequests";
import EmployeeWorkflow from "@/pages/EmployeeWorkflow";
import About from "@/pages/About";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Index />
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
        path: "/schedule",
        element: (
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        ),
      },
      {
        path: "/restaurant-schedule",
        element: (
          <ProtectedRoute>
            <RestaurantSchedule />
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
        path: "/payroll",
        element: (
          <ProtectedRoute>
            <Payroll />
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
        path: "/people",
        element: (
          <ProtectedRoute>
            <People />
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
        path: "/profile-settings",
        element: (
          <ProtectedRoute>
            <ProfileSettings />
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
        path: "/attendance",
        element: (
          <ProtectedRoute>
            <Attendance />
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
        path: "/hiring",
        element: (
          <ProtectedRoute>
            <Hiring />
          </ProtectedRoute>
        ),
      },
      {
        path: "/schedule-requests",
        element: (
          <ProtectedRoute>
            <ScheduleRequests />
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
        path: "/about",
        element: (
          <ProtectedRoute>
            <About />
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
