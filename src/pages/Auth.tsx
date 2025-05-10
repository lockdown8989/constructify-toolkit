
import React, { useEffect } from "react";
import { Navigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useAuthPage } from "@/hooks/auth/useAuthPage";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { ResetPasswordMode } from "@/components/auth/ResetPasswordMode";

const Auth = () => {
  const { user, session, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  const {
    from,
    activeTab,
    setActiveTab,
    isResetMode,
    isRecoveryMode,
    handleShowResetPassword,
    handleBackToSignIn
  } = useAuthPage();

  // Check for recovery token in URL
  const hasRecoveryToken = searchParams.has("token") || window.location.hash.includes("access_token=");
  
  useEffect(() => {
    // Log authentication state for debugging
    console.log("Auth page state:", { 
      isAuthenticated,
      hasSession: !!session,
      hasUser: !!user,
      currentPath: location.pathname,
      user: user?.email,
      isResetMode, 
      isRecoveryMode, 
      hasRecoveryToken,
      redirectTo: from,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'unknown'
    });
  }, [user, session, isAuthenticated, isResetMode, isRecoveryMode, hasRecoveryToken, from, location]);

  // If we have a token in the URL but not in reset mode, force reset mode
  const shouldShowReset = isResetMode || isRecoveryMode || hasRecoveryToken;

  // Redirect authenticated users to dashboard if not in reset mode
  if (isAuthenticated && !shouldShowReset) {
    console.log("Auth page - User is authenticated, redirecting to:", from || "/dashboard");
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
        <AuthTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onForgotPassword={handleShowResetPassword}
          onBackToSignIn={handleBackToSignIn}
        />
      </div>
    </div>
  );
};

export default Auth;
