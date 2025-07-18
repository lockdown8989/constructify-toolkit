
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

export const UpdatePasswordForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "password">("email");
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const { toast } = useToast();

  const isResetMode = searchParams.get("reset") === "true";
  const isRecoveryMode = searchParams.get("type") === "recovery";

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          setHasValidSession(false);
          return;
        }
        
        // Check if we have a valid session or recovery tokens in the URL
        const hasAccessToken = window.location.hash.includes("access_token=");
        const hasRecoveryToken = searchParams.has("token") || hasAccessToken;
        
        if (session || hasRecoveryToken || isRecoveryMode) {
          setHasValidSession(true);
          // Skip email step if we have a valid session/token
          if (session || hasRecoveryToken) {
            setStep("password");
          }
        } else {
          setHasValidSession(false);
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setHasValidSession(false);
      }
    };

    checkSession();
  }, [isResetMode, isRecoveryMode, searchParams]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setStep("password");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate password
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await updatePassword(password);
      
      if (error) {
        setError(error.message);
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSuccess(true);
        toast({
          title: "Password updated successfully",
          description: "Your password has been reset. You will be redirected to the dashboard shortly.",
          variant: "default",
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking session
  if (hasValidSession === null) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardContent className="space-y-4 text-center py-6">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-gray-600">Verifying reset session...</p>
        </CardContent>
      </Card>
    );
  }

  // Show error if no valid session
  if (hasValidSession === false) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto bg-red-100 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-center text-2xl">Auth session missing!</CardTitle>
          <CardDescription className="text-center">
            No valid password reset session found. Please request a new password reset link.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This page can only be accessed through a valid password reset link sent to your email.
            </AlertDescription>
          </Alert>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={() => {
              // Clear URL parameters to return to normal sign-in
              navigate("/auth", { replace: true });
              window.location.reload();
            }} 
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="space-y-1">
        <div className="mx-auto bg-primary/10 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-center text-2xl">
          {step === "email" ? "Confirm Email Address" : "Create New Password"}
        </CardTitle>
        <CardDescription className="text-center">
          {step === "email" 
            ? "Please confirm the email address for this password reset"
            : "Please enter a new secure password for your account"
          }
        </CardDescription>
        {step === "password" && (
          <p className="text-xs text-center text-gray-500">
            Password reset for: <strong>{email}</strong>
          </p>
        )}
      </CardHeader>
      
      {!success ? (
        <>
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Confirm the email address associated with your account
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setStep("email")}
                >
                  Back to Email
                </Button>
              </CardFooter>
            </form>
          )}
        </>
      ) : (
        <CardContent className="space-y-4 text-center py-6">
          <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-medium">Password Updated Successfully</h3>
          <p className="text-gray-600">
            Your password has been changed. You will be redirected to the dashboard momentarily.
          </p>
        </CardContent>
      )}
    </Card>
  );
};
