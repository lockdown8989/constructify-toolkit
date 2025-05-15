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
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employee-workflow" element={<Schedule />} />
          <Route path="/employee-calendar" element={<EmployeeCalendar />} /> {/* New employee calendar route */}
          <Route path="/shift-calendar" element={<RestaurantSchedule />} />
          <Route path="/notifications" element={<NotificationTest />} />
          <Route path="/schedule-requests" element={<ScheduleRequests />} />
          <Route path="/leave-management" element={<LeaveManagement />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/salary" element={<Salary />} />
          <Route path="/people" element={<People />} />
          <Route path="/time-clock" element={<TimeClock />} />
          <Route path="/manager-time-clock" element={<ManagerTimeClock />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/hiring" element={<Hiring />} />
          <Route path="/attendance" element={<Attendance />} />
        </Route>
        
        {/* Auth Routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/reset-password" element={<Auth resetPassword />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        
        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
