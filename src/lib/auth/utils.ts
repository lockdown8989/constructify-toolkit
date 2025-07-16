// Authentication utility functions
import { AuthError } from '@supabase/supabase-js';
import { UserRole } from './types';

export const getAuthErrorMessage = (error: AuthError | Error | null): string => {
  if (!error) return 'An unknown error occurred';
  
  const message = error.message.toLowerCase();
  
  // Map common Supabase auth errors to user-friendly messages
  if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (message.includes('email not confirmed')) {
    return 'Please check your email and click the confirmation link before signing in.';
  }
  
  if (message.includes('signup disabled')) {
    return 'Account registration is currently disabled. Please contact support.';
  }
  
  if (message.includes('email already registered') || message.includes('user already registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  
  if (message.includes('weak password')) {
    return 'Password is too weak. Please choose a stronger password.';
  }
  
  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  
  if (message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes before trying again.';
  }
  
  // Return the original message if no specific mapping found
  return error.message || 'An unexpected error occurred. Please try again.';
};

export const getRolePriority = (role: UserRole): number => {
  const priorities: Record<UserRole, number> = {
    admin: 5,
    hr: 4,
    manager: 3,
    payroll: 2,
    employee: 1,
    employer: 3 // Same as manager
  };
  return priorities[role] || 0;
};

export const getPrimaryRole = (roles: UserRole[]): UserRole | null => {
  if (!roles || roles.length === 0) return null;
  
  return roles.reduce((primary, current) => {
    if (!primary) return current;
    return getRolePriority(current) > getRolePriority(primary) ? current : primary;
  }, null as UserRole | null);
};

export const hasRole = (userRoles: UserRole[], requiredRole: UserRole): boolean => {
  return userRoles.includes(requiredRole);
};

export const hasAnyRole = (userRoles: UserRole[], requiredRoles: UserRole[]): boolean => {
  return requiredRoles.some(role => userRoles.includes(role));
};

export const canAccessRoute = (
  userRoles: UserRole[],
  requiredRole?: UserRole,
  requiredRoles?: UserRole[]
): boolean => {
  if (!requiredRole && !requiredRoles) return true;
  
  if (requiredRole) {
    return hasRole(userRoles, requiredRole);
  }
  
  if (requiredRoles) {
    return hasAnyRole(userRoles, requiredRoles);
  }
  
  return false;
};

export const formatUserName = (user: any): string => {
  if (user?.user_metadata?.firstName && user?.user_metadata?.lastName) {
    return `${user.user_metadata.firstName} ${user.user_metadata.lastName}`;
  }
  
  if (user?.user_metadata?.name) {
    return user.user_metadata.name;
  }
  
  if (user?.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

export const getRedirectUrl = (): string => {
  return `${window.location.origin}/auth?verified=true`;
};

export const parseUrlParams = (searchParams: URLSearchParams) => {
  return {
    mode: searchParams.get('mode') || 'signin',
    tab: searchParams.get('tab'),
    reset: searchParams.get('reset') === 'true',
    type: searchParams.get('type'),
    token: searchParams.get('token'),
    from: searchParams.get('from') || '/dashboard',
    verified: searchParams.get('verified') === 'true',
    signout: searchParams.has('signout') || searchParams.get('action') === 'signout'
  };
};