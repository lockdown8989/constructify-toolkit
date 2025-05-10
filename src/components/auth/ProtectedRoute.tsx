
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'hr' | 'manager';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, session, isLoading, isAdmin, isHR, isManager } = useAuth();
  const location = useLocation();

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

  // Improved authentication check
  const isAuthenticated = !!user && !!session;

  console.log("Auth state in ProtectedRoute:", { 
    isAuthenticated, 
    hasSession: !!session,
    userId: user?.id,
    path: location.pathname
  });

  if (!isAuthenticated) {
    // Redirect to the login page, but save the current path to redirect back after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Check for required role
  if (requiredRole) {
    if (requiredRole === 'admin' && !isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRole === 'hr' && !isHR && !isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
    if (requiredRole === 'manager' && !isManager && !isAdmin && !isHR) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
