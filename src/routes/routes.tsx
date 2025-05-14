
// This file is kept for reference purposes only
// Routes are now defined directly in App.tsx to avoid duplicate router instances

import { Navigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";

// Export all pages for reuse in App.tsx
export {
  Auth,
  Index,
  Dashboard,
  NotFound
};

// Export layout components
export {
  AppLayout,
  ProtectedRoute
};
