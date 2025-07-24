
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { ThemeProvider } from "next-themes";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Schedule from "@/pages/Schedule";
import People from "@/pages/People";
import Payroll from "@/pages/Payroll";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import TimeClock from "@/pages/TimeClock";
import LeaveManagement from "@/pages/LeaveManagement";
import ShiftPatterns from "@/pages/ShiftPatterns";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <LanguageProvider>
                <Routes>
                  <Route path="/*" element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="people" element={<People />} />
                    <Route path="payroll" element={<Payroll />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="time-clock" element={<TimeClock />} />
                    <Route path="leave-management" element={<LeaveManagement />} />
                    <Route path="shift-patterns" element={<ShiftPatterns />} />
                  </Route>
                </Routes>
              </LanguageProvider>
            </AuthProvider>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
