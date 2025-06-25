import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { startAttendanceMonitoring, stopAttendanceMonitoring } from "@/services/attendance/attendance-monitoring";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import RequireAuth from "./components/auth/RequireAuth";
import { AuthProvider } from "./hooks/use-auth";
import ShiftPatterns from "./pages/ShiftPatterns";
import NotificationsPage from "./pages/NotificationsPage";
import Attendance from "./pages/Attendance";
import Hiring from "./pages/Hiring";
import Projects from "./pages/Projects";
import ShiftCalendar from "./pages/ShiftCalendar";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Start attendance monitoring when app loads
    startAttendanceMonitoring();
    
    // Cleanup on unmount
    return () => {
      stopAttendanceMonitoring();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/employees" element={<RequireAuth><Employees /></RequireAuth>} />
            <Route path="/schedule" element={<RequireAuth><Schedule /></RequireAuth>} />
            <Route path="/shiftcalendar" element={<RequireAuth><ShiftCalendar /></RequireAuth>} />
            <Route path="/shiftpatterns" element={<RequireAuth><ShiftPatterns /></RequireAuth>} />
            <Route path="/attendance" element={<RequireAuth><Attendance /></RequireAuth>} />
            
            <Route path="/hiring" element={<RequireAuth><Hiring /></RequireAuth>} />
            <Route path="/projects" element={<RequireAuth><Projects /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
            
            <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
