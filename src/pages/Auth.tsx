
import React, { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useAuthPage } from "@/hooks/auth/useAuthPage";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { ResetPasswordMode } from "@/components/auth/ResetPasswordMode";

const Auth = () => {
  const { signIn, signUp, user } = useAuth();
  const [searchParams] = useSearchParams();
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
  
  // Check if this is a sign-out redirect
  const isSignOut = searchParams.has("signout") || searchParams.get("action") === "signout";
  
  useEffect(() => {
    // Log authentication state for debugging
    console.log("Auth page state:", { 
      isAuthenticated: !!user,
      isResetMode, 
      isRecoveryMode, 
      hasRecoveryToken,
      isSignOut,
      from
    });
    
    // If this is a sign-out redirect, force a check of auth state
    if (isSignOut) {
      console.log("Sign-out detected, force-checking auth state");
    }
  }, [user, isResetMode, isRecoveryMode, hasRecoveryToken, isSignOut, from]);

  // If we have a token in the URL but not in reset mode, force reset mode
  const shouldShowReset = isResetMode || isRecoveryMode || hasRecoveryToken;

  // Redirect authenticated users to dashboard unless they're in reset mode
  // or just signed out (in which case we'll show the sign in form)
  if (user && !shouldShowReset && !isSignOut) {
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
          onSignIn={signIn}
          onSignUp={signUp}
        />
      </div>
    </div>
  );
};

export default Auth;
