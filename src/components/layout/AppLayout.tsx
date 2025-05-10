
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/auth";
import { setupRealtimeSubscriptions } from '@/services/setup-realtime';
import { useEffect } from 'react';
import { Loader2 } from "lucide-react";

const AppLayout = () => {
  const { user, session, isLoading } = useAuth();
  const location = useLocation();
  const isAuthenticated = !!user && !!session;

  useEffect(() => {
    // Set up realtime subscriptions when the app loads and user is authenticated
    if (isAuthenticated) {
      setupRealtimeSubscriptions();
    }
  }, [isAuthenticated]);

  // Debug authentication state
  console.log("AppLayout auth state:", { 
    isAuthenticated, 
    isLoading,
    currentPath: location.pathname,
    user: user?.email
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on auth page, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-16">
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;
