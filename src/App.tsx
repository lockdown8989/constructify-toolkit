
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/auth";
import AppLayout from "@/components/layout/AppLayout";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const People = lazy(() => import("./pages/People"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Schedule = lazy(() => import("./pages/Schedule"));
const TimeClock = lazy(() => import("./pages/TimeClock"));
const LeaveManagement = lazy(() => import("./pages/LeaveManagement"));
const Payroll = lazy(() => import("./pages/Payroll"));
const Salary = lazy(() => import("./pages/Salary"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/auth" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Auth />
                  </Suspense>
                } />
                <Route path="/" element={<AppLayout />}>
                  <Route index element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Index />
                    </Suspense>
                  } />
                  <Route path="dashboard" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="people" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <People />
                    </Suspense>
                  } />
                  <Route path="attendance" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Attendance />
                    </Suspense>
                  } />
                  <Route path="schedule" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Schedule />
                    </Suspense>
                  } />
                  <Route path="time-clock" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <TimeClock />
                    </Suspense>
                  } />
                  <Route path="leave-management" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <LeaveManagement />
                    </Suspense>
                  } />
                  <Route path="payroll" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Payroll />
                    </Suspense>
                  } />
                  <Route path="salary" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Salary />
                    </Suspense>
                  } />
                  <Route path="profile" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Profile />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Settings />
                    </Suspense>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
