
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserInfoFieldsProps = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  onFirstNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLastNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const UserInfoFields = ({
  firstName,
  lastName,
  email,
  password,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange
}: UserInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={onFirstNameChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={onLastNameChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input
          id="email-signup"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={onEmailChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-signup">Password</Label>
        <Input
          id="password-signup"
          type="password"
          value={password}
          onChange={onPasswordChange}
          required
          minLength={6}
        />
        <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
      </div>
    </>
  );
};
