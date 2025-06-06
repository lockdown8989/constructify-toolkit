
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock } from "lucide-react";
import { useInputSanitization } from "@/hooks/auth/useInputSanitization";
import { PasswordStrengthIndicator } from "../PasswordStrengthIndicator";

interface UserInfoFieldsProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UserInfoFields: React.FC<UserInfoFieldsProps> = ({
  firstName,
  lastName,
  email,
  password,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange
}) => {
  const { sanitizeEmail, sanitizeName } = useInputSanitization();

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeName(e.target.value);
    onFirstNameChange({ ...e, target: { ...e.target, value: sanitized } });
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeName(e.target.value);
    onLastNameChange({ ...e, target: { ...e.target, value: sanitized } });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeEmail(e.target.value);
    onEmailChange({ ...e, target: { ...e.target, value: sanitized } });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="firstName"
              placeholder="First name"
              value={firstName}
              onChange={handleFirstNameChange}
              className="pl-10"
              required
              autoComplete="given-name"
              maxLength={50}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              id="lastName"
              placeholder="Last name"
              value={lastName}
              onChange={handleLastNameChange}
              className="pl-10"
              required
              autoComplete="family-name"
              maxLength={50}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            className="pl-10"
            required
            autoComplete="email"
            maxLength={254}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            id="password"
            type="password"
            placeholder="Create a secure password"
            value={password}
            onChange={onPasswordChange}
            className="pl-10"
            required
            autoComplete="new-password"
            maxLength={128}
          />
        </div>
        <PasswordStrengthIndicator password={password} />
      </div>
    </>
  );
};
