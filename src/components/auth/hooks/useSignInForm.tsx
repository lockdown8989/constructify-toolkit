
import { useState } from "react";
import { useSignIn } from "@/hooks/auth/actions/useSignIn";

type UseSignInFormProps = {
  onSignIn?: (email: string, password: string) => Promise<any>;
};

export const useSignInForm = ({ onSignIn }: UseSignInFormProps = {}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showResetOption, setShowResetOption] = useState(false);
  
  const { signIn: defaultSignIn, resetPassword } = useSignIn();
  const signInFunction = onSignIn || defaultSignIn;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage) setErrorMessage("");
    if (showResetOption) setShowResetOption(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
    if (showResetOption) setShowResetOption(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setShowResetOption(false);

    try {
      const result = await signInFunction(email.trim(), password);
      
      if (result?.error) {
        console.error("Sign in error:", result.error);
        
        // Handle specific error cases
        if (result.error.message?.includes("Invalid login credentials") || 
            result.error.message?.includes("Invalid email or password")) {
          setErrorMessage("Invalid email or password. Please check your credentials and try again.");
          setShowResetOption(true); // Show reset option for credential errors
        } else if (result.error.message?.includes("Email not confirmed")) {
          setErrorMessage("Please verify your email address before signing in.");
        } else if (result.error.message?.includes("Too many requests")) {
          setErrorMessage("Too many sign in attempts. Please wait a moment and try again.");
        } else {
          setErrorMessage(result.error.message || "Sign in failed. Please try again.");
        }
      } else if (result?.data?.user) {
        // Successful sign in - redirect will be handled by auth provider
        console.log("✅ Sign in successful");
        setErrorMessage(""); // Clear any previous errors
      }
    } catch (error) {
      console.error("Sign in exception:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address first");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const result = await resetPassword(email.trim());
      
      if (result?.error) {
        setErrorMessage("Failed to send password reset email. Please try again.");
      } else {
        setErrorMessage("Password reset email sent! Please check your inbox.");
        setShowResetOption(false);
      }
    } catch (error) {
      setErrorMessage("Failed to send password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    errorMessage,
    showResetOption,
    canAttempt: true,
    attemptsRemaining: Infinity,
    remainingBlockTime: 0,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handlePasswordReset
  };
};
