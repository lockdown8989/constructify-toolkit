
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Mail, Lock, Eye, EyeOff, Check, X } from "lucide-react";

type UserInfoFieldsProps = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export const UserInfoFields = ({
  firstName,
  lastName,
  email,
  password,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  disabled = false
}: UserInfoFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    return { checks, passedChecks, isStrong: passedChecks === 5 };
  };

  const passwordStrength = getPasswordStrength(password);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="firstName"
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={onFirstNameChange}
              className="pl-10"
              disabled={disabled}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="lastName"
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={onLastNameChange}
              className="pl-10"
              disabled={disabled}
              required
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={onEmailChange}
            className="pl-10"
            disabled={disabled}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a secure password"
            value={password}
            onChange={onPasswordChange}
            className="pl-10 pr-12"
            disabled={disabled}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </Button>
        </div>
        
        {password && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Password strength:</span>
              <span className={`font-medium ${
                passwordStrength.passedChecks === 5 ? 'text-green-600' :
                passwordStrength.passedChecks >= 3 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {passwordStrength.passedChecks === 5 ? 'Strong' :
                 passwordStrength.passedChecks >= 3 ? 'Medium' : 'Weak'}
              </span>
            </div>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 ${passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}`}>
                {passwordStrength.checks.length ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                {passwordStrength.checks.uppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>One uppercase letter</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                {passwordStrength.checks.lowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>One lowercase letter</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}`}>
                {passwordStrength.checks.number ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>One number</span>
              </div>
              <div className={`flex items-center gap-2 ${passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}`}>
                {passwordStrength.checks.special ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>One special character</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
