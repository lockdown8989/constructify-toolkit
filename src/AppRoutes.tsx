
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import People from '@/pages/People';
import Schedule from '@/pages/Schedule';
import Attendance from '@/pages/Attendance';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import LeaveManagement from '@/pages/LeaveManagement';
import TimeClock from '@/pages/TimeClock';
import ScheduleRequests from '@/pages/ScheduleRequests';
import RestaurantSchedule from '@/pages/RestaurantSchedule';
import Hiring from '@/pages/Hiring';
import Salary from '@/pages/Salary';
import Payroll from '@/pages/Payroll';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LandingPage from '@/pages/LandingPage';
import { useAuth } from '@/hooks/use-auth';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/leave" element={<ProtectedRoute><LeaveManagement /></ProtectedRoute>} />
      <Route path="/time-clock" element={<ProtectedRoute><TimeClock /></ProtectedRoute>} />
      <Route path="/schedule-requests" element={<ProtectedRoute><ScheduleRequests /></ProtectedRoute>} />
      <Route path="/restaurant-schedule" element={<ProtectedRoute><RestaurantSchedule /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/hiring" element={<ProtectedRoute><Hiring /></ProtectedRoute>} />
      <Route path="/salary" element={<ProtectedRoute><Salary /></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute><Payroll /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
