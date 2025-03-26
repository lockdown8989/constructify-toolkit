
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'hr' | 'manager' | 'employee';
  allowHigherRoles?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole = 'employee',
  allowHigherRoles = true 
}: ProtectedRouteProps) => {
  const { user, isLoading, isAdmin, isHR, isManager, isEmployee, userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for required role
  if (requiredRole) {
    // If higher roles are allowed and user has admin role, always grant access
    if (allowHigherRoles && isAdmin) {
      return <>{children}</>;
    }

    // Check specific role requirements
    switch (requiredRole) {
      case 'admin':
        if (!isAdmin) {
          return <Navigate to="/dashboard" replace />;
        }
        break;
      case 'hr':
        if (!isHR && !(allowHigherRoles && isAdmin)) {
          return <Navigate to="/dashboard" replace />;
        }
        break;
      case 'manager':
        if (!isManager && !(allowHigherRoles && (isAdmin || isHR))) {
          return <Navigate to="/dashboard" replace />;
        }
        break;
      case 'employee':
        // All authenticated users have at least employee access
        break;
      default:
        break;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
