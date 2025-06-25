
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { startAttendanceMonitoring, stopAttendanceMonitoring } from "@/services/attendance/attendance-monitoring";
import Dashboard from "./pages/Dashboard";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./hooks/use-auth";
import ShiftPatterns from "./pages/ShiftPatterns";
import Attendance from "./pages/Attendance";
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
          <AuthProvider>
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
              <Route path="/shiftcalendar" element={<ProtectedRoute><ShiftCalendar /></ProtectedRoute>} />
              <Route path="/shiftpatterns" element={<ProtectedRoute><ShiftPatterns /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
