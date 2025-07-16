
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/auth";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Privacy from "./pages/Privacy";
import Dashboard from "./pages/Dashboard";
import People from "./pages/People";
import Schedules from "./pages/Schedules";
import Availability from "./pages/Availability";
import Settings from "./pages/Settings";
import ProfileSettings from "./pages/ProfileSettings";
import Payroll from "./pages/Payroll";
import PayrollSettings from "./pages/PayrollSettings";
import Attendance from "./pages/Attendance";
import Hiring from "./pages/Hiring";
import Projects from "./pages/Projects";
import { useAuth } from "@/hooks/auth";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/people"
                element={
                  <ProtectedRoute>
                    <People />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/schedules"
                element={
                  <ProtectedRoute>
                    <Schedules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/availability"
                element={
                  <ProtectedRoute>
                    <Availability />
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
                path="/payroll"
                element={
                  <ProtectedRoute>
                    <Payroll />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payroll-settings"
                element={
                  <ProtectedRoute>
                    <PayrollSettings />
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
                path="/hiring"
                element={
                  <ProtectedRoute>
                    <Hiring />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Projects />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export default App;
