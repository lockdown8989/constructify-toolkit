
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignInFieldsProps = {
  email: string;
  password: string;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onForgotPassword: () => void;
};

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
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={onEmailChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          required
        />
      </div>
      
      <div className="text-right">
        <button 
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          Forgot password?
        </button>
      </div>
    </>
  );
};
