
import React, { useEffect } from 'react';
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "@/hooks/auth";
import { setupRealtimeSubscriptions } from '@/services/setup-realtime';

const AppLayout = ({ children }: React.PropsWithChildren) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  useEffect(() => {
    // Set up realtime subscriptions when the app loads and user is authenticated
    setupRealtimeSubscriptions();
  }, []);

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
