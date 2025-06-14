
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";

interface SignInFieldsProps {
  email: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onForgotPassword: () => void;
}

export const SignInFields: React.FC<SignInFieldsProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onForgotPassword
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={onEmailChange}
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
            placeholder="Enter your password"
            value={password}
            onChange={onPasswordChange}
            className="pl-10"
            required
            autoComplete="current-password"
            maxLength={128}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="button"
          variant="link"
          className="px-0 text-sm"
          onClick={onForgotPassword}
        >
          Forgot your password?
        </Button>
      </div>
    </>
  );
};
