
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Mail, ArrowLeft, CheckCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

type ResetPasswordFormProps = {
  onBackToSignIn: () => void;
};

export const ResetPasswordForm = ({ onBackToSignIn }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSmtpHelp, setShowSmtpHelp] = useState(false);
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
        // Check if it's an SMTP error
        if (error.message.includes('Username and Password not accepted') || 
            error.message.includes('SMTP') || 
            error.message.includes('sending')) {
          setError("Email delivery issue. This may be due to SMTP configuration problems.");
          setShowSmtpHelp(true);
        } else {
          setError(error.message);
        }
        
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
            
            {showSmtpHelp && (
              <Alert className="bg-amber-50 border-amber-200 mb-4">
                <div className="space-y-2">
                  <p className="text-amber-800 text-sm">
                    <strong>SMTP Configuration Note:</strong> Gmail requires using an App Password instead of your regular password for SMTP.
                  </p>
                  <ol className="list-decimal list-inside text-amber-800 text-sm space-y-1">
                    <li>Enable 2-Factor Authentication on your Gmail account</li>
                    <li>Generate an App Password in your Google Account settings</li>
                    <li>Use that App Password in Supabase SMTP settings</li>
                  </ol>
                  <div className="flex items-center text-sm mt-2">
                    <a 
                      href="https://support.google.com/accounts/answer/185833" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 flex items-center hover:underline"
                    >
                      Learn how to create an App Password <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                </div>
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
                Reset link will be sent from TeamPulse &lt;tampulseagent@gmail.com&gt;
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
              If your email exists in our system, you'll receive a password reset link from <strong>TeamPulse &lt;tampulseagent@gmail.com&gt;</strong> shortly.
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
