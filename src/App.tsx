
import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from './hooks/use-auth';
import { LanguageProvider } from './hooks/use-language';
import { ThemeProvider } from './hooks/use-theme';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import BackgroundNotificationService from './services/shift-notifications/background-notification-service';
import LoadingSpinner from './components/ui/loading-spinner';
import { useAttendanceMonitoring } from './hooks/use-attendance-monitoring';
import './App.css';

// Lazy load pages for better performance
const People = lazy(() => import('./pages/People'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Payroll = lazy(() => import('./pages/Payroll'));
const PayrollDashboard = lazy(() => import('./pages/PayrollDashboard'));
const Payslips = lazy(() => import('./pages/Payslips'));
const Schedule = lazy(() => import('./pages/Schedule'));
const ShiftPatterns = lazy(() => import('./pages/ShiftPatterns'));
const RotaEmployee = lazy(() => import('./pages/RotaEmployee'));

const ShiftCalendar = lazy(() => import('./pages/ShiftCalendar'));
const EmployeeWorkflow = lazy(() => import('./pages/EmployeeWorkflow'));
const TimeClock = lazy(() => import('./pages/TimeClock'));
const ManagerTimeClock = lazy(() => import('./pages/ManagerTimeClock'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement'));
const ScheduleRequests = lazy(() => import('./pages/ScheduleRequests'));
const Profile = lazy(() => import('./pages/Profile'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const OvertimeManagement = lazy(() => import('./pages/OvertimeManagement'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
    },
  },
});

// Create a separate component that uses useAuth
const AppContent = () => {
  const { user } = useAuth();
  
  // Initialize attendance monitoring
  useAttendanceMonitoring();

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
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public routes without layout */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes with layout */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProfileSettings />
            </Suspense>
          } />
          <Route path="people" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <Suspense fallback={<LoadingSpinner />}>
                <People />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="attendance" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Attendance />
            </Suspense>
          } />
          <Route path="leave-management" element={
            <Suspense fallback={<LoadingSpinner />}>
              <LeaveManagement />
            </Suspense>
          } />
          <Route path="schedule-requests" element={
            <Suspense fallback={<LoadingSpinner />}>
              <ScheduleRequests />
            </Suspense>
          } />
          <Route path="payroll" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager', 'payroll']}>
              <Suspense fallback={<LoadingSpinner />}>
                <Payroll />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="payroll-dashboard" element={
            <ProtectedRoute requiredRole="payroll">
              <Suspense fallback={<LoadingSpinner />}>
                <PayrollDashboard />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="payslips" element={
            <ProtectedRoute requiredRole="payroll">
              <Suspense fallback={<LoadingSpinner />}>
                <Payslips />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="schedule" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Schedule />
            </Suspense>
          } />
          <Route path="shift-patterns" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <Suspense fallback={<LoadingSpinner />}>
                <ShiftPatterns />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="rota-employee" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <Suspense fallback={<LoadingSpinner />}>
                <RotaEmployee />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="shift-calendar" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <Suspense fallback={<LoadingSpinner />}>
                <ShiftCalendar />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="employee-workflow" element={
            <Suspense fallback={<LoadingSpinner />}>
              <EmployeeWorkflow />
            </Suspense>
          } />
          <Route path="time-clock" element={
            <Suspense fallback={<LoadingSpinner />}>
              <TimeClock />
            </Suspense>
          } />
          <Route path="manager-time-clock" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <Suspense fallback={<LoadingSpinner />}>
                <ManagerTimeClock />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="overtime-management" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <Suspense fallback={<LoadingSpinner />}>
                <OvertimeManagement />
              </Suspense>
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
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <AuthProvider>
            <LanguageProvider>
              <TooltipProvider>
                <AppContent />
                <Toaster />
              </TooltipProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
