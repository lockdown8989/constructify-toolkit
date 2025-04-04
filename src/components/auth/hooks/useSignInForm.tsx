
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
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Use a simpler approach to handle auth
      const { error } = await onSignIn(email, password);
      
      if (error) {
        console.log("Authentication error:", error.message);
        setErrorMessage(error.message || "Invalid login credentials");
        setIsLoading(false);
        return;
      }
      
      // If no error, navigate to dashboard (this assumes user state is handled in the parent component)
      toast({
        title: "Success",
        description: "Signed in successfully",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMessage("An unexpected error occurred during sign in");
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
