
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/auth";
import { setupRealtimeSubscriptions } from '@/services/setup-realtime';
import { useEffect, useState } from 'react';
import { Loader2 } from "lucide-react";

const AppLayout = () => {
  const { user, session, isLoading } = useAuth();
  const location = useLocation();
  const isAuthenticated = !!user && !!session;
  const [isSettingUp, setIsSettingUp] = useState(false);

  useEffect(() => {
    // Set up realtime subscriptions when the app loads and user is authenticated
    if (isAuthenticated) {
      setIsSettingUp(true);
      setupRealtimeSubscriptions()
        .then(() => {
          console.log("Setting up realtime subscriptions for authenticated user");
        })
        .finally(() => {
          setIsSettingUp(false);
        });
    }
  }, [isAuthenticated]);

  // Debug authentication state
  console.log("AppLayout auth state:", { 
    isAuthenticated, 
    isLoading,
    hasSession: !!session,
    hasUser: !!user,
    currentPath: location.pathname,
    user: user?.email,
    redirecting: !isAuthenticated && !isLoading ? true : false
  });

  if (isLoading || isSettingUp) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">
            {isSettingUp ? "Setting up application..." : "Loading authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on auth page, redirect to auth page
  // Store the current location so we can redirect back after login
  if (!isAuthenticated) {
    console.log("AppLayout: User not authenticated, redirecting to /auth from", location.pathname);
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
