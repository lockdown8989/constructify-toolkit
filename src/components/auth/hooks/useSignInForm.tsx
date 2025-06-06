
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthLimiting } from "@/hooks/auth/useAuthLimiting";
import { useInputSanitization } from "@/hooks/auth/useInputSanitization";

type SignInFormProps = {
  onSignIn: (email: string, password: string) => Promise<any>;
};

export const useSignInForm = ({ onSignIn }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    canAttempt, 
    attemptsRemaining, 
    remainingBlockTime, 
    recordFailedAttempt, 
    recordSuccessfulAuth 
  } = useAuthLimiting();
  const { sanitizeEmail, validateEmail } = useInputSanitization();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeEmail(e.target.value);
    setEmail(sanitized);
    if (errorMessage) setErrorMessage(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAttempt) {
      const minutes = Math.ceil(remainingBlockTime / 60);
      setErrorMessage(`Too many failed attempts. Please try again in ${minutes} minutes.`);
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Input validation
      if (!email || !password) {
        setErrorMessage("Email and password are required");
        setIsLoading(false);
        return;
      }
      
      if (!validateEmail(email)) {
        setErrorMessage("Please enter a valid email address");
        setIsLoading(false);
        return;
      }
      
      const result = await onSignIn(email, password);
      
      if (result.error) {
        recordFailedAttempt();
        
        // Generic error messages for security
        if (result.error.message === "Invalid login credentials") {
          setErrorMessage(`Invalid credentials. ${attemptsRemaining - 1} attempts remaining.`);
        } else if (result.error.message.includes("Email not confirmed")) {
          setErrorMessage("Please check your email and verify your account before signing in.");
        } else {
          setErrorMessage("Sign in failed. Please check your credentials and try again.");
        }
        
        setIsLoading(false);
        return;
      }
      
      if (result.data?.user) {
        recordSuccessfulAuth();
        toast({
          title: "Welcome back",
          description: "You have been signed in successfully",
        });
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setErrorMessage("Sign in failed. Please try again.");
      }
    } catch (error) {
      recordFailedAttempt();
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    errorMessage,
    canAttempt,
    attemptsRemaining,
    remainingBlockTime,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  };
};
