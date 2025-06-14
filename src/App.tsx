
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import Attendance from "@/pages/Attendance";
import AttendanceManager from "@/pages/AttendanceManager";
import LeaveManagement from "@/pages/LeaveManagement";
import EmployeeManagement from "@/pages/EmployeeManagement";
import PayrollDashboard from "@/pages/PayrollDashboard";
import PayrollHistory from "@/pages/PayrollHistory";
import PayrollSummary from "@/pages/PayrollSummary";
import Documents from "@/pages/Documents";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import ShiftCalendar from "@/pages/ShiftCalendar";
import OpenShifts from "@/pages/OpenShifts";
import RestaurantSchedule from "@/pages/RestaurantSchedule";
import DocumentsManager from "@/pages/DocumentsManager";
import Notifications from "@/pages/Notifications";
import ShiftPatternsPage from "@/components/shift-patterns/ShiftPatternsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/attendance-manager" element={<AttendanceManager />} />
                  <Route path="/leave-management" element={<LeaveManagement />} />
                  <Route path="/employee-management" element={<EmployeeManagement />} />
                  <Route path="/payroll-dashboard" element={<PayrollDashboard />} />
                  <Route path="/payroll-history" element={<PayrollHistory />} />
                  <Route path="/payroll-summary" element={<PayrollSummary />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/documents-manager" element={<DocumentsManager />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/shift-calendar" element={<ShiftCalendar />} />
                  <Route path="/open-shifts" element={<OpenShifts />} />
                  <Route path="/restaurant-schedule" element={<RestaurantSchedule />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/shift-patterns" element={<ShiftPatternsPage />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
