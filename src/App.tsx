
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './hooks/auth';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import People from './pages/People';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Schedule from './pages/Schedule';
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
        <AuthProvider>
          <TooltipProvider>
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
                  <Route path="people" element={<People />} />
                  <Route path="attendance" element={<Attendance />} />
                  <Route path="payroll" element={<Payroll />} />
                  <Route path="schedule" element={<Schedule />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
