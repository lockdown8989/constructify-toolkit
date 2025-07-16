// Main authentication page
import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthContext';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthTabs } from '@/components/auth/AuthTabs';
import { UpdatePasswordForm } from '@/components/auth/forms/UpdatePasswordForm';
import { parseUrlParams } from '@/lib/auth/utils';
import { AuthMode } from '@/lib/auth/types';

const Auth: React.FC = () => {
  const { isAuthenticated, isLoading, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Parse URL parameters
  const urlParams = parseUrlParams(searchParams);
  const [activeTab, setActiveTab] = useState<AuthMode>(
    urlParams.tab === 'signup' ? 'signup' : 'signin'
  );
  const [authLoading, setAuthLoading] = useState(false);

  // Determine if we should show password recovery form
  const isRecoveryMode = urlParams.type === 'recovery' || 
                        urlParams.reset || 
                        window.location.hash.includes('access_token=') ||
                        searchParams.has('token');

  // Get redirect destination
  const from = location.state?.from?.pathname || urlParams.from;

  // Update tab when URL changes
  useEffect(() => {
    if (urlParams.tab === 'signup') {
      setActiveTab('signup');
    } else if (urlParams.tab === 'signin') {
      setActiveTab('signin');
    }
  }, [urlParams.tab]);

  // Log auth state for debugging
  useEffect(() => {
    console.group('🔐 Auth Page State');
    console.log('Authentication state:', {
      isAuthenticated,
      isLoading,
      isRecoveryMode,
      activeTab,
      from,
      urlParams,
      currentUrl: window.location.href,
    });
    console.groupEnd();
  }, [isAuthenticated, isLoading, isRecoveryMode, activeTab, from, urlParams]);

  // Handle sign in
  const handleSignIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const result = await signIn(email, password);
      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle sign up
  const handleSignUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    setAuthLoading(true);
    try {
      const result = await signUp(email, password, {
        firstName,
        lastName,
      });
      return result;
    } finally {
      setAuthLoading(false);
    }
  };

  // Redirect authenticated users (unless in recovery mode or just signed out)
  if (isAuthenticated && !isRecoveryMode && !urlParams.signout) {
    console.log('✅ Authenticated user, redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  // Show password recovery form if in recovery mode
  if (isRecoveryMode) {
    console.log('🔑 Showing password recovery form');
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <AuthHeader />
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <UpdatePasswordForm />
          </div>
        </div>
      </div>
    );
  }

  // Show main auth interface
  console.log('📝 Showing auth interface');
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthHeader />
        
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <AuthTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab as (value: string) => void}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            isLoading={authLoading || isLoading}
          />
        </div>
        
        {/* Test account info */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Test Account:</strong><br />
            Email: test@admin.com<br />
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;