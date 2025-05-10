
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
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
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Add more detailed logging to help diagnose auth issues
  console.log("Auth state in ProtectedRoute:", { 
    isAuthenticated: !!user && !!session, 
    hasSession: !!session,
    userId: user?.id,
    path: location.pathname
  });

  if (!user || !session) {
    // Store the current location so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Check for required role
  if (requiredRole) {
    let hasRequiredRole = false;
    
    if (requiredRole === 'admin' && isAdmin) {
      hasRequiredRole = true;
    } else if (requiredRole === 'hr' && (isHR || isAdmin)) {
      hasRequiredRole = true;
    } else if (requiredRole === 'manager' && (isManager || isAdmin || isHR)) {
      hasRequiredRole = true;
    }
    
    if (!hasRequiredRole) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
