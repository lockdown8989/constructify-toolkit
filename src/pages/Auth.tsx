
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation, Navigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from?.pathname || "/dashboard";
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Get the tab parameter from URL
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam === "signup" ? "signup" : "signin");
  
  const isResetMode = searchParams.get("reset") === "true";
  const type = searchParams.get("type");
  const isRecoveryMode = type === "recovery";

  // Update active tab when URL parameter changes
  useEffect(() => {
    if (tabParam === "signup") {
      setActiveTab("signup");
    }
  }, [tabParam]);

  if (user && !isResetMode && !isRecoveryMode) {
    return <Navigate to={from} replace />;
  }

  if (isResetMode || isRecoveryMode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">TeamPulse</h1>
            <p className="text-gray-600">HR Management Platform</p>
          </div>
          <UpdatePasswordForm />
        </div>
      </div>
    );
  }

  const handleShowResetPassword = () => {
    setShowResetPassword(true);
    setActiveTab("reset");
  };

  const handleBackToSignIn = () => {
    setShowResetPassword(false);
    setActiveTab("signin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">TeamPulse</h1>
          <p className="text-gray-600">HR Management Platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <SignInForm 
              onSignIn={signIn} 
              onForgotPassword={handleShowResetPassword} 
            />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignUpForm onSignUp={signUp} />
          </TabsContent>

          <TabsContent value="reset">
            <ResetPasswordForm onBackToSignIn={handleBackToSignIn} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
