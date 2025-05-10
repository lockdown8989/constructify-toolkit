
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type SignInFormProps = {
  onSignIn: (email: string, password: string) => Promise<any>;
};

export const useSignInForm = ({ onSignIn }: SignInFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get redirect path from location state, defaulting to dashboard
  const from = location.state?.from || "/dashboard";

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing again
    if (errorMessage) setErrorMessage(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing again
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log("Attempting to sign in with:", email);
      console.log("Will redirect to:", from);
      
      if (!email || !password) {
        setErrorMessage("Email and password are required");
        setIsLoading(false);
        return;
      }
      
      // For debugging - remove email/password whitespace
      const trimmedEmail = email.trim();
      const result = await onSignIn(trimmedEmail, password);
      
      console.log("Sign in result:", result);
      
      if (result?.error) {
        console.error("Authentication error:", result.error.message);
        
        // Provide more specific error messages based on error code
        if (result.error.message === "Invalid login credentials") {
          setErrorMessage("Invalid email or password. Please check your credentials and try again.");
        } else {
          setErrorMessage(result.error.message || "Invalid login credentials");
        }
        
        setIsLoading(false);
        return;
      }
      
      if (result?.data?.user) {
        console.log("Sign in successful, user:", result.data.user.email);
        console.log("Redirecting to:", from);
        
        toast({
          title: "Success",
          description: "Signed in successfully",
        });
        
        // Add a slight delay before redirecting to ensure toast is shown
        setTimeout(() => {
          navigate(from);
        }, 500);
      } else {
        setErrorMessage("Something went wrong during sign in");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    errorMessage,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  };
};
