
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
import { ErrorBoundary } from './components/auth/ErrorBoundary';
import { MobileAuthErrorBoundary } from './components/auth/MobileAuthErrorBoundary';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import BackgroundNotificationService from './services/shift-notifications/background-notification-service';
import LoadingSpinner from './components/ui/loading-spinner';
import { useAttendanceMonitoring } from './hooks/use-attendance-monitoring';
import { useIsMobile } from './hooks/use-mobile';
import './App.css';
import CookieConsent from './components/legal/CookieConsent';


// Lazy load pages for better performance
const People = lazy(() => import('./pages/People'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Payroll = lazy(() => import('./pages/Payroll'));
const PayrollDashboard = lazy(() => import('./pages/PayrollDashboard'));
const PayrollReports = lazy(() => import('./pages/PayrollReports'));
const Payslips = lazy(() => import('./pages/Payslips'));
const PayrollSettings = lazy(() => import('./pages/PayrollSettings'));
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
const Billing = lazy(() => import('./pages/Billing'));

// Public marketing and legal pages
import LandingPage from './pages/LandingPage';
import SuccessPage from './pages/SuccessPage';
import SubscriptionRequired from './pages/SubscriptionRequired';
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const Terms = lazy(() => import('./pages/legal/Terms'));
const Cookies = lazy(() => import('./pages/legal/Cookies'));
const GDPR = lazy(() => import('./pages/legal/GDPR'));

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
  const isMobile = useIsMobile();
  
  // Initialize attendance monitoring
  useAttendanceMonitoring();

  // Start background notification service when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('🔔 Starting background notification service');
      const notificationService = BackgroundNotificationService.getInstance();
      notificationService.start();

      return () => {
        console.log('🔔 Stopping background notification service');
        notificationService.stop();
      };
    }
  }, [user]);

  console.log('🚀 App rendering:', {
    hasUser: !!user,
    isMobile,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
  
  const ErrorBoundaryComponent = isMobile ? MobileAuthErrorBoundary : ErrorBoundary;
  
  return (
    <ErrorBoundaryComponent>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes - These should always be accessible first */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/subscription-required" element={<SubscriptionRequired />} />
          <Route path="/privacy" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Privacy />
            </Suspense>
          } />
          <Route path="/terms" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Terms />
            </Suspense>
          } />
          <Route path="/cookies" element={
            <Suspense fallback={<LoadingSpinner />}>
              <Cookies />
            </Suspense>
          } />
          <Route path="/gdpr" element={
            <Suspense fallback={<LoadingSpinner />}>
              <GDPR />
            </Suspense>
          } />
          
          {/* Protected app routes - Explicit paths only */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
          </Route>
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <Profile />
              </Suspense>
            } />
          </Route>
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <ProfileSettings />
              </Suspense>
            } />
</Route>
          
          <Route path="/billing" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <Billing />
              </Suspense>
            } />
          </Route>
          
          <Route path="/people" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <People />
              </Suspense>
            } />
          </Route>
          
          <Route path="/attendance" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <Attendance />
              </Suspense>
            } />
          </Route>
          
          <Route path="/leave-management" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <LeaveManagement />
              </Suspense>
            } />
          </Route>
          
          <Route path="/schedule-requests" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <ScheduleRequests />
              </Suspense>
            } />
          </Route>
          
          <Route path="/payroll" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager', 'payroll']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <Payroll />
              </Suspense>
            } />
          </Route>
          
          <Route path="/payroll-dashboard" element={
            <ProtectedRoute requiredRole="payroll">
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <PayrollDashboard />
              </Suspense>
            } />
          </Route>
          
          <Route path="/payroll-settings" element={
            <ProtectedRoute requiredRole="payroll">
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <PayrollSettings />
              </Suspense>
            } />
          </Route>
          
          <Route path="/payroll-reports" element={
            <ProtectedRoute requiredRole="payroll">
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <PayrollReports />
              </Suspense>
            } />
          </Route>
          
          <Route path="/payslips" element={
            <ProtectedRoute requiredRole="payroll">
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <Payslips />
              </Suspense>
            } />
          </Route>
          
          <Route path="/schedule" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <Schedule />
              </Suspense>
            } />
          </Route>
          
          <Route path="/shift-patterns" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <ShiftPatterns />
              </Suspense>
            } />
          </Route>
          
          <Route path="/rota-employee" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <RotaEmployee />
              </Suspense>
            } />
          </Route>
          
          <Route path="/shift-calendar" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <ShiftCalendar />
              </Suspense>
            } />
          </Route>
          
          <Route path="/employee-workflow" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <EmployeeWorkflow />
              </Suspense>
            } />
          </Route>
          
          <Route path="/time-clock" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <TimeClock />
              </Suspense>
            } />
          </Route>
          
          <Route path="/manager-time-clock" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <ManagerTimeClock />
              </Suspense>
            } />
          </Route>
          
          <Route path="/overtime-management" element={
            <ProtectedRoute requiredRoles={['admin', 'hr', 'manager']}>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={
              <Suspense fallback={<LoadingSpinner />}>
                <OvertimeManagement />
              </Suspense>
            } />
          </Route>
          
          {/* Catch-all route - redirect unknown paths to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <CookieConsent />
    </ErrorBoundaryComponent>
  );
};

function App() {
  console.log('🚀 App component mounted');
  
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

export default App;
