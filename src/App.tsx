
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import AppLayout from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Schedule from "@/pages/Schedule";
import Attendance from "@/pages/Attendance";
import LeaveManagement from "@/pages/LeaveManagement";
import PayrollDashboard from "@/pages/PayrollDashboard";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import RestaurantSchedule from "@/pages/RestaurantSchedule";
import ShiftPatternsPage from "@/components/shift-patterns/ShiftPatternsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/*" element={
                <AppLayout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/leave-management" element={<LeaveManagement />} />
                    <Route path="/payroll-dashboard" element={<PayrollDashboard />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/restaurant-schedule" element={<RestaurantSchedule />} />
                    <Route path="/shift-patterns" element={<ShiftPatternsPage />} />
                  </Routes>
                </AppLayout>
              } />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
