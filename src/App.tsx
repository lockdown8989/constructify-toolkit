
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/hooks/use-language";
import { ThemeProvider } from "next-themes";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Attendance from "@/pages/Attendance";
import Schedule from "@/pages/Schedule";
import People from "@/pages/People";
import Payroll from "@/pages/Payroll";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Profile from "@/pages/Profile";
import TimeClock from "@/pages/TimeClock";
import LeaveManagement from "@/pages/LeaveManagement";
import MySchedule from "@/pages/MySchedule";
import EmployeeProfile from "@/pages/EmployeeProfile";
import ManagerSchedule from "@/pages/ManagerSchedule";
import ShiftPatterns from "@/pages/ShiftPatterns";
import OpenShifts from "@/pages/OpenShifts";
import ManageAvailability from "@/pages/ManageAvailability";
import PrivateRoute from "@/components/PrivateRoute";

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
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="schedule" element={<Schedule />} />
                    <Route path="people" element={<People />} />
                    <Route path="payroll" element={<Payroll />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="time-clock" element={<TimeClock />} />
                    <Route path="leave-management" element={<LeaveManagement />} />
                    <Route path="my-schedule" element={<MySchedule />} />
                    <Route path="employee/:id" element={<EmployeeProfile />} />
                    <Route path="manager-schedule" element={<ManagerSchedule />} />
                    <Route path="shift-patterns" element={<ShiftPatterns />} />
                    <Route path="open-shifts" element={<OpenShifts />} />
                    <Route path="manage-availability" element={<ManageAvailability />} />
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
