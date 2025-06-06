
import React from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSignInForm } from "./hooks/useSignInForm";
import { SignInFields } from "./components/SignInFields";
import { AlertCircle, Clock } from "lucide-react";

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
    canAttempt,
    attemptsRemaining,
    remainingBlockTime,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  } = useSignInForm({ onSignIn });

  const formatBlockTime = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {!canAttempt && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 items-start">
              <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Account temporarily locked</p>
                <p>Too many failed attempts. Try again in {formatBlockTime(remainingBlockTime)}.</p>
              </div>
            </div>
          )}
          
          {errorMessage && (
            <div className="p-3 bg-destructive/10 rounded-md flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">{errorMessage}</div>
            </div>
          )}
          
          {canAttempt && attemptsRemaining <= 3 && attemptsRemaining > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before temporary lockout.
              </p>
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
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !canAttempt}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
