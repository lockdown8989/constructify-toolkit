
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { ThemeProvider } from "next-themes";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Schedule from "@/pages/Schedule";
import People from "@/pages/People";
import Payroll from "@/pages/Payroll";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import TimeClock from "@/pages/TimeClock";
import LeaveManagement from "@/pages/LeaveManagement";
import ShiftPatterns from "@/pages/ShiftPatterns";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/attendance" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Attendance />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/schedule" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Schedule />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/people" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <People />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/payroll" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Payroll />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Reports />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Profile />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/time-clock" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <TimeClock />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/leave-management" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <LeaveManagement />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  <Route path="/shift-patterns" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <ShiftPatterns />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                </Routes>
                <Toaster />
                <Sonner />
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
