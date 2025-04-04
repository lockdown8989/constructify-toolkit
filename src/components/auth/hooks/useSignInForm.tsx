
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { toast } = useToast();

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
      
      if (!email || !password) {
        setErrorMessage("Email and password are required");
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await onSignIn(email, password);
      
      if (error) {
        console.error("Authentication error:", error.message);
        setErrorMessage(error.message || "Invalid login credentials");
        setIsLoading(false);
        return;
      }
      
      if (data?.user) {
        console.log("Sign in successful, user:", data.user.email);
        toast({
          title: "Success",
          description: "Signed in successfully",
        });
        
        // Add a slight delay before redirecting to ensure toast is shown
        setTimeout(() => {
          navigate("/dashboard");
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
