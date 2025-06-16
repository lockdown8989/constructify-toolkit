
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SignInForm from './components/auth/SignInForm';
import SignUpForm from './components/auth/SignUpForm';
import Dashboard from './pages/Dashboard';
import PeoplePage from './pages/PeoplePage';
import AttendancePage from './pages/AttendancePage';
import PayrollPage from './pages/PayrollPage';
import SchedulePage from './pages/SchedulePage';
import { useAuth } from './hooks/use-auth';
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

function App() {
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/auth" element={<SignInForm />} />
                <Route path="/auth/signup" element={<SignUpForm />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/people" element={
                  <ProtectedRoute>
                    <PeoplePage />
                  </ProtectedRoute>
                } />
                <Route path="/attendance" element={
                  <ProtectedRoute>
                    <AttendancePage />
                  </ProtectedRoute>
                } />
                <Route path="/payroll" element={
                  <ProtectedRoute>
                    <PayrollPage />
                  </ProtectedRoute>
                } />
                <Route path="/schedule" element={
                  <ProtectedRoute>
                    <SchedulePage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
