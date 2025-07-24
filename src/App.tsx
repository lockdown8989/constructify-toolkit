
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
import AppLayout from "@/components/AppLayout";
import PrivateRoute from "@/components/PrivateRoute";

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
                    <PrivateRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/attendance" element={
                    <PrivateRoute>
                      <AppLayout>
                        <Attendance />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/schedule" element={
                    <PrivateRoute>
                      <AppLayout>
                        <Schedule />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/people" element={
                    <PrivateRoute>
                      <AppLayout>
                        <People />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/payroll" element={
                    <PrivateRoute>
                      <AppLayout>
                        <Payroll />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/reports" element={
                    <PrivateRoute>
                      <AppLayout>
                        <Reports />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/settings" element={
                    <PrivateRoute>
                      <AppLayout>
                        <Settings />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <AppLayout>
                        <Profile />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/time-clock" element={
                    <PrivateRoute>
                      <AppLayout>
                        <TimeClock />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/leave-management" element={
                    <PrivateRoute>
                      <AppLayout>
                        <LeaveManagement />
                      </AppLayout>
                    </PrivateRoute>
                  } />
                  <Route path="/shift-patterns" element={
                    <PrivateRoute>
                      <AppLayout>
                        <ShiftPatterns />
                      </AppLayout>
                    </PrivateRoute>
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
