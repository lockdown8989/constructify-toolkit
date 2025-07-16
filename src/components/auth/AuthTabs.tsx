
// Authentication tabs component
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from './forms/SignInForm';
import { SignUpForm } from './forms/SignUpForm';
import { ResetPasswordForm } from './forms/ResetPasswordForm';

interface AuthTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  onSignIn: (email: string, password: string) => Promise<any>;
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  isLoading?: boolean;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
  activeTab,
  setActiveTab,
  onSignIn,
  onSignUp,
  isLoading = false,
}) => {
  const handleForgotPassword = () => {
    setActiveTab('reset');
  };

  const handleBackToSignIn = () => {
    setActiveTab('signin');
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {activeTab !== 'reset' && (
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
      )}
      
      <TabsContent value="signin" className="mt-0">
        <SignInForm
          onSubmit={onSignIn}
          onForgotPassword={handleForgotPassword}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="signup" className="mt-0">
        <SignUpForm
          onSubmit={onSignUp}
          isLoading={isLoading}
        />
      </TabsContent>
      
      <TabsContent value="reset" className="mt-0">
        <ResetPasswordForm onBack={handleBackToSignIn} />
      </TabsContent>
    </Tabs>
  );
};
