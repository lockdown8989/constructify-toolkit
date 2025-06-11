
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthLimiting } from "@/hooks/auth/useAuthLimiting";
import { useInputSanitization } from "@/hooks/auth/useInputSanitization";

export const useSignUpForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const { 
    canAttempt, 
    attemptsRemaining, 
    remainingBlockTime, 
    recordFailedAttempt, 
    recordSuccessfulAuth 
  } = useAuthLimiting();
  const { sanitizeEmail, sanitizeName, validateEmail } = useInputSanitization();

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeName(e.target.value);
    setFirstName(sanitized);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeName(e.target.value);
    setLastName(sanitized);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeEmail(e.target.value);
    setEmail(sanitized);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const getFullName = () => `${firstName.trim()} ${lastName.trim()}`.trim();

  const validateForm = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return false;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Validation Error", 
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    setIsLoading,
    canAttempt,
    attemptsRemaining,
    remainingBlockTime,
    recordFailedAttempt,
    recordSuccessfulAuth,
    handleFirstNameChange,
    handleLastNameChange,
    handleEmailChange,
    handlePasswordChange,
    getFullName,
    validateForm
  };
};
