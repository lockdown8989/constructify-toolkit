
import { useState } from "react";

export const useSignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) {
      return false;
    }
    if (!lastName.trim()) {
      return false;
    }
    if (!email.trim()) {
      return false;
    }
    if (!password || password.length < 8) {
      return false;
    }
    return true;
  };

  const getFullName = () => {
    return `${firstName.trim()} ${lastName.trim()}`.trim();
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    isLoading,
    setIsLoading,
    validateForm,
    getFullName
  };
};
