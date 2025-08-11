
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'hr' | 'manager' | 'employee' | 'payroll';
  requiredRoles?: ('admin' | 'hr' | 'manager' | 'employee' | 'payroll')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredRoles 
}) => {
  const { user, isLoading, isAdmin, isHR, isManager, isEmployee, isPayroll, subscribed } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', {
    isLoading,
    hasUser: !!user,
    requiredRole,
    requiredRoles,
    userRoles: { isAdmin, isHR, isManager, isEmployee, isPayroll }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

if (!user) {
  console.log('No user, redirecting to auth');
  return <Navigate to="/auth" replace />;
}

// Org subscription gating:
// - Subscribed users get full access
// - Unsubscribed: admins can access billing and dashboard; non-admins are blocked from billing only
const isBillingPath = location.pathname.startsWith('/billing');
const isDashboardPath = location.pathname.startsWith('/dashboard');

if (subscribed === false) {
  if (isAdmin) {
    // Admins: allow dashboard and billing; redirect all other pages to dashboard
    if (!isBillingPath && !isDashboardPath) {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // Non-admins: allow normal app usage, but block billing page
    if (isBillingPath) {
      return <Navigate to="/dashboard" replace />;
    }
  }
} else if (subscribed === true) {
  // Subscribed users get full access to all routes - no restrictions
  console.log('✅ User has active subscription - full access granted');
}

  // Check single required role
  if (requiredRole) {
    const hasRequiredRole = 
      (requiredRole === 'admin' && isAdmin) ||
      (requiredRole === 'hr' && isHR) ||
      (requiredRole === 'manager' && isManager) ||
      (requiredRole === 'employee' && isEmployee) ||
      (requiredRole === 'payroll' && isPayroll);

    console.log('Single role check:', { requiredRole, hasRequiredRole });

    if (!hasRequiredRole) {
      console.log('User does not have required role, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check multiple required roles (user needs at least one)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAnyRequiredRole = requiredRoles.some(role => 
      (role === 'admin' && isAdmin) ||
      (role === 'hr' && isHR) ||
      (role === 'manager' && isManager) ||
      (role === 'employee' && isEmployee) ||
      (role === 'payroll' && isPayroll)
    );

    console.log('Multiple roles check:', { requiredRoles, hasAnyRequiredRole });

    if (!hasAnyRequiredRole) {
      console.log('User does not have any required role, redirecting to dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  console.log('Access granted, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
