
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

interface AuthTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onForgotPassword: () => void;
  onBackToSignIn: () => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, userData: any) => Promise<void>;
}

export const AuthTabs = ({
  activeTab,
  setActiveTab,
  onForgotPassword,
  onBackToSignIn,
  onSignIn,
  onSignUp
}: AuthTabsProps) => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  // Check if user was redirected after account deletion
  const wasDeleted = searchParams.get('deleted') === 'true';
  
  // Show confirmation message for deleted accounts
  if (wasDeleted) {
    setTimeout(() => {
      toast({
        title: "Account Successfully Deleted",
        description: "Your account and all data have been permanently removed from our system.",
        duration: 6000,
      });
    }, 500);
  }

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin">
          <SignInForm onSubmit={onSignIn} />
          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={onForgotPassword}
            >
              Forgot your password?
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="signup">
          <SignUpForm onSubmit={onSignUp} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
