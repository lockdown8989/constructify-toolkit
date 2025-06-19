
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSecurityValidation } from '@/hooks/security/useSecurityValidation';

interface SecureSignInFieldsProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  disabled?: boolean;
}

export const SecureSignInFields: React.FC<SecureSignInFieldsProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  disabled
}) => {
  const { validateEmailSecure } = useSecurityValidation();
  const [emailError, setEmailError] = useState<string>('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onEmailChange(value);
    
    // Real-time validation
    if (value) {
      const validation = validateEmailSecure(value);
      setEmailError(validation.isValid ? '' : validation.errors[0]);
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={handleEmailChange}
          disabled={disabled}
          className={emailError ? 'border-red-500' : ''}
          autoComplete="email"
        />
        {emailError && (
          <p className="text-sm text-red-500 mt-1">{emailError}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          disabled={disabled}
          autoComplete="current-password"
        />
      </div>
    </div>
  );
};
