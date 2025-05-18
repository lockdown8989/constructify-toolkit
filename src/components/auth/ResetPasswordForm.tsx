
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ResetPasswordFormProps = {
  onBackToSignIn: () => void;
};

export const ResetPasswordForm = ({ onBackToSignIn }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!email || !email.trim()) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }
    
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error.message);
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
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-center">Reset Your Password</CardTitle>
        <CardDescription className="text-center">
          {isSubmitted 
            ? "Please check your email for a password reset link" 
            : "Enter your email address and we'll send you a link to reset your password"}
        </CardDescription>
      </CardHeader>
      
      {!isSubmitted ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Reset link will be sent via configured SMTP server
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={onBackToSignIn}
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Button>
          </CardFooter>
        </form>
      ) : (
        <CardFooter className="flex flex-col space-y-5 pt-4">
          <div className="bg-blue-50 p-4 rounded-md text-center">
            <CheckCircle className="h-10 w-10 mx-auto text-green-500 mb-2" />
            <p className="text-sm text-gray-700">
              Reset link sent to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-700 mt-2">
              If your email exists in our system, you'll receive a password reset link shortly.
              Please check your inbox and spam folder.
            </p>
          </div>
          <Button
            type="button"
            className="w-full flex items-center gap-2 justify-center"
            onClick={onBackToSignIn}
          >
            <ArrowLeft className="h-4 w-4" /> Return to Sign In
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
