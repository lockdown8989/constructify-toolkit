import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useAuth } from './hooks/auth';
import { Account } from './components/Account';
import Home from './pages/Home';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Attendance from './pages/Attendance';
import Documents from './pages/Documents';
import Schedule from './pages/Schedule';
import ScheduleRequests from './pages/ScheduleRequests';
import EmployeeComposition from './pages/EmployeeComposition';
import Interview from './pages/Interview';
import LeaveManagement from './pages/LeaveManagement';
import WorkflowPage from './pages/WorkflowPage';

const App = () => {
  const { session } = useAuth();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Simulate checking authentication status
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsAuthReady(true);
    };

    checkAuth();
  }, []);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthReady) {
      return <div>Loading...</div>;
    }

    if (!session) {
      return <Navigate to="/login" />;
    }

    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <div className="container" style={{ padding: '50px 0 100px 0' }}>
        <Routes>
          <Route
            path="/login"
            element={
              !session ? (
                <Auth
                  supabaseClient={useAuth().supabase}
                  appearance={{ theme: ThemeSupa }}
                  providers={['google', 'github']}
                  redirectTo="http://localhost:5173/"
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account session={session} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <Payroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
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
            path="/employee-composition"
            element={
              <ProtectedRoute>
                <EmployeeComposition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview"
            element={
              <ProtectedRoute>
                <Interview />
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
          <Route path="/workflow" element={
              <ProtectedRoute>
                <WorkflowPage />
              </ProtectedRoute>
            } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
