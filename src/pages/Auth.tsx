import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation, Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = location.state?.from?.pathname || "/dashboard";
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  
  const isResetMode = searchParams.get("reset") === "true";
  const type = searchParams.get("type");
  const isRecoveryMode = type === "recovery";

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

const SignInForm = ({ 
  onSignIn, 
  onForgotPassword 
}: { 
  onSignIn: (email: string, password: string) => Promise<any>,
  onForgotPassword: () => void
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await onSignIn(email, password);
      if (!error) {
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="text-right">
            <button 
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

const ResetPasswordForm = ({ onBackToSignIn }: { onBackToSignIn: () => void }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsSubmitted(true);
        toast({
          title: "Reset link sent",
          description: "Check your email for a password reset link",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          {isSubmitted 
            ? "Check your email for a password reset link" 
            : "Enter your email to receive a password reset link"}
        </CardDescription>
      </CardHeader>
      
      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBackToSignIn}
            >
              Back to Sign In
            </Button>
          </CardFooter>
        </form>
      ) : (
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <p className="text-center text-sm text-gray-600">
            If your email exists in our system, you'll receive a password reset link shortly.
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={onBackToSignIn}
          >
            Back to Sign In
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

const SignUpForm = ({ onSignUp }: { onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any> }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "hr" | "employee" | "employer">("employee");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await onSignUp(email, password, firstName, lastName);
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: existingRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', user.id);
            
          if (rolesError) {
            toast({
              title: "Error",
              description: "Could not fetch user roles: " + rolesError.message,
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          
          const roleExists = existingRoles?.some(r => r.role === userRole);
          
          if (!roleExists) {
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ 
                user_id: user.id, 
                role: userRole 
              });
              
            if (insertError) {
              console.error("Role insertion error:", insertError);
              toast({
                title: "Error",
                description: "Could not assign user role: " + insertError.message,
                variant: "destructive",
              });
            } else {
              toast({
                title: "Success",
                description: `Account created with ${userRole} role.`,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (value: string) => {
    if (value === "admin" || value === "hr" || value === "employee" || value === "employer") {
      setUserRole(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email-signup">Email</Label>
            <Input
              id="email-signup"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password-signup">Password</Label>
            <Input
              id="password-signup"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
          </div>
          
          <div className="space-y-2">
            <Label>Account Type</Label>
            <RadioGroup
              value={userRole}
              onValueChange={handleRoleChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee" id="employee" />
                <Label htmlFor="employee">Employee</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employer" id="employer" />
                <Label htmlFor="employer">Employer</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default Auth;
