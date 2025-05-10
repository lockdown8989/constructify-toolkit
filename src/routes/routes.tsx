
import { useRoutes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import People from "@/pages/People";
import LeaveManagement from "@/pages/LeaveManagement";
import Schedule from "@/pages/Schedule";
import ScheduleRequests from "@/pages/ScheduleRequests";
import EmployeeWorkflow from "@/pages/EmployeeWorkflow";
import Hiring from "@/pages/Hiring";
import Payroll from "@/pages/Payroll";
import Salary from "@/pages/Salary";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import RestaurantSchedule from "@/pages/RestaurantSchedule";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import LandingPage from "@/pages/LandingPage";
import About from "@/pages/About"; // Import the new About page
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import EmployeeDetailsPage from "@/components/people/EmployeeDetailsPage";
import Attendance from "@/pages/Attendance";
import TimeClock from "@/pages/TimeClock";

const RouterComponent = () => {
  const routes = useRoutes([
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
          index: true,
          element: <Index />,
        },
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "people",
          element: <People />,
        },
        {
          path: "people/:id",
          element: <EmployeeDetailsPage />,
        },
        {
          path: "leave",
          element: <LeaveManagement />,
        },
        {
          path: "leave-management",
          element: <LeaveManagement />,
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
          path: "employee-workflow",
          element: <EmployeeWorkflow />,
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
          path: "shift-calendar",
          element: <RestaurantSchedule />,
        },
        {
          path: "restaurant-schedule",
          element: <RestaurantSchedule />,
        },
        {
          path: "settings",
          element: <Settings />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
        {
          path: "attendance",
          element: <Attendance />,
        },
        {
          path: "time-clock",
          element: <TimeClock />,
        },
        {
          path: "about", // Add About page route
          element: <About />,
        },
      ],
    },
    {
      path: "/landing",
      element: <LandingPage />,
    },
    {
      path: "/about", // Add public About page route
      element: <About />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return routes;
};

export default RouterComponent;
