
import React, { useEffect, useState } from "react";
import { Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useAuthPage } from "@/hooks/auth/useAuthPage";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { ResetPasswordMode } from "@/components/auth/ResetPasswordMode";

const Auth = () => {
  const { user, isAuthenticated, isLoading, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);
  
  const {
    from,
    activeTab,
    setActiveTab,
    isResetMode,
    isRecoveryMode,
    handleShowResetPassword,
    handleBackToSignIn
  } = useAuthPage();

  // Add timeout for debugging loading issues
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn("Auth page still loading after 3 seconds, potential issue with auth state");
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Log authentication state for debugging
  useEffect(() => {
    console.log("Auth page state:", { 
      isAuthenticated,
      isLoading,
      currentPath: location.pathname,
      user: user?.email,
      isResetMode, 
      isRecoveryMode,
      redirectTo: from
    });
  }, [user, isAuthenticated, isLoading, isResetMode, isRecoveryMode, from, location]);

  // Check for recovery token in URL
  const hasRecoveryToken = searchParams.has("token") || window.location.hash.includes("access_token=");
  
  // If we have a token in the URL but not in reset mode, force reset mode
  const shouldShowReset = isResetMode || isRecoveryMode || hasRecoveryToken;

  // Don't redirect while still loading auth state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900">Checking authentication...</h2>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard if not in reset mode
  if (isAuthenticated && !shouldShowReset) {
    console.log("Auth page - User is authenticated, redirecting to:", from);
    return <Navigate to={from || "/dashboard"} replace />;
  }

  // Show password reset form if in reset or recovery mode
  if (shouldShowReset) {
    return <ResetPasswordMode />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <AuthHeader />
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {authError}
          </div>
        )}
        <AuthTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onForgotPassword={handleShowResetPassword}
          onBackToSignIn={handleBackToSignIn}
          onSignIn={(email, password) => {
            setAuthError(null);
            return signIn(email, password);
          }}
          onSignUp={signUp}
        />
      </div>
    </div>
  );
};

export default Auth;
