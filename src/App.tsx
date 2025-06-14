
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import Attendance from "@/pages/Attendance";
import LeaveManagement from "@/pages/LeaveManagement";
import People from "@/pages/People";
import PayrollDashboard from "@/pages/PayrollDashboard";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import RestaurantSchedule from "@/pages/RestaurantSchedule";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/*" element={
            <MainLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leave-management" element={<LeaveManagement />} />
                <Route path="/employee-management" element={<People />} />
                <Route path="/payroll-dashboard" element={<PayrollDashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/restaurant-schedule" element={<RestaurantSchedule />} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
