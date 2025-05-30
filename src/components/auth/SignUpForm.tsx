
import React from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserInfoFields } from "./components/UserInfoFields";
import { AccountTypeSelector } from "./components/AccountTypeSelector";
import { ManagerIdInput } from "./components/ManagerIdInput";
import { useSignUp } from "./hooks/useSignUp";
import { AlertCircle } from "lucide-react";
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
    signUpError
  } = useSignUp({ onSignUp });

  // Add extra logging for debugging
  React.useEffect(() => {
    console.log(`Manager ID in form: ${managerId}, validation status: ${isManagerIdValid}`);
  }, [managerId, isManagerIdValid]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {signUpError && (
            <Alert variant="destructive" className="p-3 bg-destructive/10 rounded-md flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <AlertDescription className="text-sm text-destructive">{signUpError}</AlertDescription>
            </Alert>
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
          />
          
          <AccountTypeSelector 
            userRole={userRole} 
            onRoleChange={handleRoleChange} 
          />
          
          {userRole === "manager" && (
            <ManagerIdInput 
              managerId={managerId}
              onGenerateManagerId={generateManagerId}
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
            />
          )}
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
