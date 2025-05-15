
import React from "react";
import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import About from "@/pages/About";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import TimeClock from "@/pages/TimeClock";
import ManagerTimeClock from "@/pages/ManagerTimeClock";
import LeaveManagement from "@/pages/LeaveManagement";
import LandingPage from "@/pages/LandingPage";
import NotFound from "@/pages/NotFound";
import Payroll from "@/pages/Payroll";
import People from "@/pages/People";
import Profile from "@/pages/Profile";
import ProfileSettings from "@/pages/ProfileSettings";
import RestaurantSchedule from "@/pages/RestaurantSchedule";
import Salary from "@/pages/Salary";
import Schedule from "@/pages/Schedule";
import ScheduleRequests from "@/pages/ScheduleRequests";
import Settings from "@/pages/Settings";
import Hiring from "@/pages/Hiring";
import Attendance from "@/pages/Attendance";
import NotificationTest from "@/components/notifications/NotificationTest";
import EmployeeCalendar from "@/pages/EmployeeCalendar";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<h1>Contact Page</h1>} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/employee-workflow" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/employee-calendar" element={<ProtectedRoute><EmployeeCalendar /></ProtectedRoute>} />
        <Route path="/shift-calendar" element={<ProtectedRoute><RestaurantSchedule /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationTest /></ProtectedRoute>} />
        <Route path="/schedule-requests" element={<ProtectedRoute><ScheduleRequests /></ProtectedRoute>} />
        <Route path="/leave-management" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
        <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute><Salary /></ProtectedRoute>} />
        <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
        <Route path="/time-clock" element={<ProtectedRoute><TimeClock /></ProtectedRoute>} />
        <Route path="/manager-time-clock" element={<ProtectedRoute><ManagerTimeClock /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/hiring" element={<ProtectedRoute><Hiring /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        
        {/* Auth Routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/reset-password" element={<Auth />} />
        <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        
        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
