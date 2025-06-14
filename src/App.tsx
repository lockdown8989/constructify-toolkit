
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
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/schedule" element={<MainLayout><Schedule /></MainLayout>} />
            <Route path="/attendance" element={<MainLayout><Attendance /></MainLayout>} />
            <Route path="/attendance-manager" element={<MainLayout><AttendanceManager /></MainLayout>} />
            <Route path="/leave-management" element={<MainLayout><LeaveManagement /></MainLayout>} />
            <Route path="/employee-management" element={<MainLayout><EmployeeManagement /></MainLayout>} />
            <Route path="/payroll-dashboard" element={<MainLayout><PayrollDashboard /></MainLayout>} />
            <Route path="/payroll-history" element={<MainLayout><PayrollHistory /></MainLayout>} />
            <Route path="/payroll-summary" element={<MainLayout><PayrollSummary /></MainLayout>} />
            <Route path="/documents" element={<MainLayout><Documents /></MainLayout>} />
            <Route path="/documents-manager" element={<MainLayout><DocumentsManager /></MainLayout>} />
            <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/shift-calendar" element={<MainLayout><ShiftCalendar /></MainLayout>} />
            <Route path="/open-shifts" element={<MainLayout><OpenShifts /></MainLayout>} />
            <Route path="/restaurant-schedule" element={<MainLayout><RestaurantSchedule /></MainLayout>} />
            <Route path="/notifications" element={<MainLayout><Notifications /></MainLayout>} />
            <Route path="/shift-patterns" element={<MainLayout><ShiftPatternsPage /></MainLayout>} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
