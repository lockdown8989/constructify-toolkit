
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
import Settings from "@/pages/Settings";
import RestaurantSchedule from "@/pages/RestaurantSchedule";
import NotFound from "@/pages/NotFound";
import AppLayout from "@/components/layout/AppLayout";
import { Navigate, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/index" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
        <Route path="/my-employees" element={<ProtectedRoute><People /></ProtectedRoute>} />
        <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
        <Route path="/schedule-requests" element={<ProtectedRoute><ScheduleRequests /></ProtectedRoute>} />
        <Route path="/restaurant-schedule" element={<ProtectedRoute><RestaurantSchedule /></ProtectedRoute>} />
        <Route path="/shift-calendar" element={<ProtectedRoute><RestaurantSchedule /></ProtectedRoute>} />
        <Route path="/employee-workflow" element={<ProtectedRoute><EmployeeWorkflow /></ProtectedRoute>} />
        <Route path="/salary" element={<ProtectedRoute><Salary /></ProtectedRoute>} />
        <Route path="/payroll" element={<ProtectedRoute requiredRole="manager"><Payroll /></ProtectedRoute>} />
        <Route path="/leave-management" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
        <Route path="/hiring" element={<ProtectedRoute><Hiring /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
