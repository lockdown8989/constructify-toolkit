
import { useState } from "react";

type UseSignInFormProps = {
  onSignIn: (email: string, password: string) => Promise<any>;
};

export const useSignInForm = ({ onSignIn }: UseSignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await onSignIn(email.trim(), password);
      
      if (result?.error) {
        console.error("Sign in error:", result.error);
        
        // Handle specific error cases
        if (result.error.message?.includes("Invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please check your credentials and try again.");
        } else if (result.error.message?.includes("Email not confirmed")) {
          setErrorMessage("Please verify your email address before signing in.");
        } else if (result.error.message?.includes("Too many requests")) {
          setErrorMessage("Too many sign in attempts. Please wait a moment and try again.");
        } else {
          setErrorMessage(result.error.message || "Sign in failed. Please try again.");
        }
      } else if (result?.data?.user) {
        // Successful sign in - redirect will be handled by auth provider
        console.log("Sign in successful");
      }
    } catch (error) {
      console.error("Sign in exception:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    errorMessage,
    canAttempt: true, // Always allow sign in attempts
    attemptsRemaining: Infinity, // No rate limiting for sign in
    remainingBlockTime: 0,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  };
};
