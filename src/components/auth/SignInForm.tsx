
import React from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSignInForm } from "./hooks/useSignInForm";
import { SignInFields } from "./components/SignInFields";
import { AlertCircle } from "lucide-react";

type SignInFormProps = {
  onSignIn: (email: string, password: string) => Promise<any>;
  onForgotPassword: () => void;
};

export const SignInForm = ({ onSignIn, onForgotPassword }: SignInFormProps) => {
  const {
    email,
    password,
    isLoading,
    errorMessage,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  } = useSignInForm({ onSignIn });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-destructive/10 rounded-md flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{errorMessage}</div>
            </div>
          )}
          
          <SignInFields
            email={email}
            password={password}
            onEmailChange={handleEmailChange}
            onPasswordChange={handlePasswordChange}
            onForgotPassword={onForgotPassword}
          />
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
