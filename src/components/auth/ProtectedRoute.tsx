
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'hr' | 'manager';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin, isHR, isManager } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is found, redirect to landing page
  if (!user) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
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
