import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/auth';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Import pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import TimeClock from '@/pages/TimeClock';
import ManagerTimeClock from '@/pages/ManagerTimeClock';
import Schedule from '@/pages/Schedule';
import ScheduleRequests from '@/pages/ScheduleRequests';
import LeaveManagement from '@/pages/LeaveManagement';
import People from '@/pages/People';
import Attendance from '@/pages/Attendance';
import Salary from '@/pages/Salary';
import Payroll from '@/pages/Payroll';
import PayrollDashboard from '@/pages/PayrollDashboard';
import Payslips from '@/pages/Payslips';
import EmployeeWorkflow from '@/pages/EmployeeWorkflow';
import RestaurantSchedule from '@/pages/RestaurantSchedule';
import Settings from '@/pages/Settings';
import ProfileSettings from '@/pages/ProfileSettings';
import Profile from '@/pages/Profile';
import Hiring from '@/pages/Hiring';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />

        {/* Protected routes with layout */}
        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll-dashboard"
            element={
              <ProtectedRoute requiredRole="payroll">
                <PayrollDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/time-clock"
            element={
              <ProtectedRoute>
                <TimeClock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager-time-clock"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <ManagerTimeClock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule-requests"
            element={
              <ProtectedRoute>
                <ScheduleRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-management"
            element={
              <ProtectedRoute>
                <LeaveManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/people"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <People />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/salary"
            element={
              <ProtectedRoute>
                <Salary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager', 'payroll']}>
                <Payroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payslips"
            element={
              <ProtectedRoute requiredRole="payroll">
                <Payslips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-workflow"
            element={
              <ProtectedRoute>
                <EmployeeWorkflow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant-schedule"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <RestaurantSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile-settings"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiring"
            element={
              <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
                <Hiring />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;
