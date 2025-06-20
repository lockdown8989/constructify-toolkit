
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from './hooks/auth';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import People from './pages/People';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import PayrollDashboard from './pages/PayrollDashboard';
import Payslips from './pages/Payslips';
import Schedule from './pages/Schedule';
import ShiftPatterns from './pages/ShiftPatterns';
import RestaurantSchedule from './pages/RestaurantSchedule';
import ShiftCalendar from './pages/ShiftCalendar';
import EmployeeWorkflow from './pages/EmployeeWorkflow';
import TimeClock from './pages/TimeClock';
import ManagerTimeClock from './pages/ManagerTimeClock';
import LeaveManagement from './pages/LeaveManagement';
import ScheduleRequests from './pages/ScheduleRequests';
import Profile from './pages/Profile';
import ProfileSettings from './pages/ProfileSettings';
import BackgroundNotificationService from './services/shift-notifications/background-notification-service';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create a separate component that uses useAuth
const AppContent = () => {
  const { user } = useAuth();

  // Start background notification service when user is authenticated
  useEffect(() => {
    if (user) {
      const notificationService = BackgroundNotificationService.getInstance();
      notificationService.start();

      return () => {
        notificationService.stop();
      };
    }
  }, [user]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes without layout */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes with layout */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<ProfileSettings />} />
          <Route path="people" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <People />
            </ProtectedRoute>
          } />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave-management" element={<LeaveManagement />} />
          <Route path="schedule-requests" element={<ScheduleRequests />} />
          <Route path="payroll" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager', 'payroll']}>
              <Payroll />
            </ProtectedRoute>
          } />
          <Route path="payroll-dashboard" element={
            <ProtectedRoute requiredRole="payroll">
              <PayrollDashboard />
            </ProtectedRoute>
          } />
          <Route path="payslips" element={
            <ProtectedRoute requiredRole="payroll">
              <Payslips />
            </ProtectedRoute>
          } />
          <Route path="schedule" element={<Schedule />} />
          <Route path="shift-patterns" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <ShiftPatterns />
            </ProtectedRoute>
          } />
          <Route path="restaurant-schedule" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <RestaurantSchedule />
            </ProtectedRoute>
          } />
          <Route path="shift-calendar" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <ShiftCalendar />
            </ProtectedRoute>
          } />
          <Route path="employee-workflow" element={<EmployeeWorkflow />} />
          <Route path="time-clock" element={<TimeClock />} />
          <Route path="manager-time-clock" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <ManagerTimeClock />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
