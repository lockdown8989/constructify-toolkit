
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

type AuthTabsProps = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  onForgotPassword: () => void;
  onBackToSignIn: () => void;
  onSignIn: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
};

export const AuthTabs = ({
  activeTab,
  setActiveTab,
  onForgotPassword,
  onBackToSignIn,
  onSignIn,
  onSignUp
}: AuthTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin">
        <SignInForm 
          onSignIn={onSignIn} 
          onForgotPassword={onForgotPassword} 
        />
      </TabsContent>
      
      <TabsContent value="signup">
        <SignUpForm onSignUp={onSignUp} />
      </TabsContent>

      <TabsContent value="reset">
        <ResetPasswordForm onBackToSignIn={onBackToSignIn} />
      </TabsContent>
    </Tabs>
  );
};
