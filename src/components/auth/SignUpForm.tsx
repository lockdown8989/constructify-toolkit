
import React from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserInfoFields } from "./components/UserInfoFields";
import { AccountTypeSelector } from "./components/AccountTypeSelector";
import { ManagerIdInput } from "./components/ManagerIdInput";
import { useSignUp } from "./hooks/useSignUp";
import { AlertCircle, Clock, Wrench } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type SignUpFormProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
};

export const SignUpForm = ({ onSignUp }: SignUpFormProps) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    userRole,
    managerId,
    setManagerId,
    isLoading,
    handleSubmit,
    handleRoleChange,
    generateManagerId,
    isValidatingManagerId,
    isManagerIdValid,
    managerName,
    signUpError,
    canAttempt,
    attemptsRemaining,
    remainingBlockTime
  } = useSignUp({ onSignUp });

  // Temporarily disable sign up while app is being built
  const isSignUpTemporarilyDisabled = true;

  const formatBlockTime = (seconds: number) => {
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {isSignUpTemporarilyDisabled && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md flex gap-2 items-start">
              <Wrench className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Sign up temporarily unavailable</p>
                <p>We're currently building the app. Sign up will be available soon!</p>
              </div>
            </div>
          )}
          
          {!canAttempt && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 items-start">
              <Clock className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Account temporarily locked</p>
                <p>Too many failed attempts. Try again in {formatBlockTime(remainingBlockTime)}.</p>
              </div>
            </div>
          )}
          
          {signUpError && (
            <Alert variant="destructive" className="p-3 bg-destructive/10 rounded-md flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <AlertDescription className="text-sm text-destructive">{signUpError}</AlertDescription>
            </Alert>
          )}
          
          {canAttempt && attemptsRemaining <= 3 && attemptsRemaining > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before temporary lockout.
              </p>
            </div>
          )}
          
          <UserInfoFields 
            firstName={firstName}
            lastName={lastName}
            email={email}
            password={password}
            onFirstNameChange={(e) => setFirstName(e.target.value)}
            onLastNameChange={(e) => setLastName(e.target.value)}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            disabled={isSignUpTemporarilyDisabled}
          />
          
          <AccountTypeSelector 
            userRole={userRole} 
            onRoleChange={handleRoleChange}
            disabled={isSignUpTemporarilyDisabled}
          />
          
          {userRole === "manager" && (
            <ManagerIdInput 
              managerId={managerId}
              onGenerateManagerId={generateManagerId}
              disabled={isSignUpTemporarilyDisabled}
            />
          )}
          
          {(userRole === "employee" || userRole === "payroll") && (
            <ManagerIdInput 
              managerId={managerId}
              onGenerateManagerId={generateManagerId}
              isReadOnly={false}
              onChange={(e) => setManagerId(e.target.value)}
              isEmployeeView={true}
              isValid={isManagerIdValid}
              isChecking={isValidatingManagerId}
              managerName={managerName}
              disabled={isSignUpTemporarilyDisabled}
            />
          )}
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !canAttempt || isSignUpTemporarilyDisabled}
          >
            {isSignUpTemporarilyDisabled 
              ? "Sign Up Unavailable" 
              : isLoading 
                ? "Creating account..." 
                : "Create Account"
            }
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
