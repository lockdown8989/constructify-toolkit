
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'hr' | 'manager';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, session, isLoading, isAdmin, isHR, isManager, isAuthenticated } = useAuth();
  const location = useLocation();

  // Detailed logging for debugging
  console.log("ProtectedRoute checking auth:", { 
    isAuthenticated, 
    hasSession: !!session,
    userId: user?.id,
    path: location.pathname,
    isLoading,
    isAdmin,
    isHR,
    isManager,
    requiredRole
  });

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to auth page with from:", location.pathname);
    // Redirect to the login page, but save the current path to redirect back after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Check for required role
  if (requiredRole) {
    let hasRequiredRole = false;
    
    // Admin has access to everything
    if (isAdmin) {
      hasRequiredRole = true;
    } 
    // HR has access to HR and manager pages
    else if (isHR && (requiredRole === 'hr' || requiredRole === 'manager')) {
      hasRequiredRole = true;
    }
    // Manager only has access to manager pages
    else if (isManager && requiredRole === 'manager') {
      hasRequiredRole = true;
    }
    
    if (!hasRequiredRole) {
      console.log(`ProtectedRoute: User lacks required role "${requiredRole}", redirecting to dashboard`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
