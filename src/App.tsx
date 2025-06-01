
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; 
import { ThemeProvider } from "@/components/theme-provider";
import { CurrencyProvider } from "@/hooks/use-currency-preference";
import { LanguageProvider } from "@/hooks/use-language";
import { NotificationProvider } from "@/hooks/use-notification-settings";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import "./App.css";

// Pages
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import LeaveManagement from "@/pages/LeaveManagement";
import Payroll from "@/pages/Payroll";
import Salary from "@/pages/Salary";
import People from "@/pages/People";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ProfileSettings from "@/pages/ProfileSettings";
import Attendance from "@/pages/Attendance";
import TimeClock from "@/pages/TimeClock";
import ManagerTimeClock from "@/pages/ManagerTimeClock";
import RestaurantSchedule from "@/pages/RestaurantSchedule";
import NotFound from "@/pages/NotFound";
import Hiring from "@/pages/Hiring";
import ScheduleRequests from "@/pages/ScheduleRequests";
import EmployeeWorkflow from "@/pages/EmployeeWorkflow";
import About from "@/pages/About";
import EmployeeScheduleView from "@/components/schedule/EmployeeScheduleView";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <LanguageProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route element={<AppLayout />}>
                  <Route path="/home" element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/schedule" element={
                    <ProtectedRoute>
                      <Schedule />
                    </ProtectedRoute>
                  } />
                  <Route path="/restaurant-schedule" element={
                    <ProtectedRoute>
                      <RestaurantSchedule />
                    </ProtectedRoute>
                  } />
                  <Route path="/shift-calendar" element={
                    <ProtectedRoute>
                      <EmployeeScheduleView />
                    </ProtectedRoute>
                  } />
                  {/* Add redirect from /leave to /leave-management */}
                  <Route path="/leave" element={<Navigate to="/leave-management" replace />} />
                  <Route path="/leave-management" element={
                    <ProtectedRoute>
                      <LeaveManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="/payroll" element={
                    <ProtectedRoute>
                      <Payroll />
                    </ProtectedRoute>
                  } />
                  <Route path="/salary" element={
                    <ProtectedRoute>
                      <Salary />
                    </ProtectedRoute>
                  } />
                  <Route path="/people" element={
                    <ProtectedRoute>
                      <People />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile-settings" element={
                    <ProtectedRoute>
                      <ProfileSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/attendance" element={
                    <ProtectedRoute>
                      <Attendance />
                    </ProtectedRoute>
                  } />
                  <Route path="/time-clock" element={
                    <ProtectedRoute>
                      <TimeClock />
                    </ProtectedRoute>
                  } />
                  <Route path="/manager-time-clock" element={
                    <ProtectedRoute>
                      <ManagerTimeClock />
                    </ProtectedRoute>
                  } />
                  <Route path="/hiring" element={
                    <ProtectedRoute>
                      <Hiring />
                    </ProtectedRoute>
                  } />
                  <Route path="/schedule-requests" element={
                    <ProtectedRoute>
                      <ScheduleRequests />
                    </ProtectedRoute>
                  } />
                  <Route path="/employee-workflow" element={
                    <ProtectedRoute>
                      <EmployeeWorkflow />
                    </ProtectedRoute>
                  } />
                  <Route path="/about" element={
                    <ProtectedRoute>
                      <About />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
              <SonnerToaster />
            </NotificationProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
