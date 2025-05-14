import { Home } from "@/pages/Home";
import { About } from "@/pages/About";
import { Contact } from "@/pages/Contact";
import { Dashboard } from "@/pages/Dashboard";
import { People } from "@/pages/People";
import { EmployeeWorkflow } from "@/pages/EmployeeWorkflow";
import { LeaveManagement } from "@/pages/LeaveManagement";
import { Salary } from "@/pages/Salary";
import { Payroll } from "@/pages/Payroll";
import { Attendance } from "@/pages/Attendance";
import { ShiftCalendar } from "@/pages/ShiftCalendar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import TimeClock from "@/pages/TimeClock";
import ManagerTimeClock from "@/pages/ManagerTimeClock";

export const routes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/people",
    element: <ProtectedRoute><People /></ProtectedRoute>,
  },
  {
    path: "/employee-workflow",
    element: <ProtectedRoute><EmployeeWorkflow /></ProtectedRoute>,
  },
  {
    path: "/leave-management",
    element: <ProtectedRoute><LeaveManagement /></ProtectedRoute>,
  },
  {
    path: "/salary",
    element: <ProtectedRoute><Salary /></ProtectedRoute>,
  },
  {
    path: "/payroll",
    element: <ProtectedRoute><Payroll /></ProtectedRoute>,
  },
  {
    path: "/attendance",
    element: <ProtectedRoute><Attendance /></ProtectedRoute>,
  },
  {
    path: "/shift-calendar",
    element: <ProtectedRoute><ShiftCalendar /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/time-clock",
    element: <ProtectedRoute><TimeClock /></ProtectedRoute>,
  },
  {
    path: "/manager-time-clock",
    element: <ProtectedRoute><ManagerTimeClock /></ProtectedRoute>,
  },
];
