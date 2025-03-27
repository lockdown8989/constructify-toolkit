
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

type ResetPasswordFormProps = {
  onBackToSignIn: () => void;
};

export const ResetPasswordForm = ({ onBackToSignIn }: ResetPasswordFormProps) => {
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
