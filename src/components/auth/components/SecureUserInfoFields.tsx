
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSecurityValidation } from '@/hooks/security/useSecurityValidation';

interface SecureUserInfoFieldsProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (firstName: string) => void;
  onLastNameChange: (lastName: string) => void;
  disabled?: boolean;
}

export const SecureUserInfoFields: React.FC<SecureUserInfoFieldsProps> = ({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  disabled
}) => {
  const { validateUserName } = useSecurityValidation();
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validation = validateUserName(value);
    
    if (validation.isValid) {
      onFirstNameChange(validation.sanitizedValue);
      setFirstNameError('');
    } else {
      onFirstNameChange(value); // Keep original for user to see
      setFirstNameError(validation.errors[0]);
    }
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validation = validateUserName(value);
    
    if (validation.isValid) {
      onLastNameChange(validation.sanitizedValue);
      setLastNameError('');
    } else {
      onLastNameChange(value); // Keep original for user to see
      setLastNameError(validation.errors[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          type="text"
          value={firstName}
          onChange={handleFirstNameChange}
          disabled={disabled}
          className={firstNameError ? 'border-red-500' : ''}
          autoComplete="given-name"
        />
        {firstNameError && (
          <p className="text-sm text-red-500 mt-1">{firstNameError}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          type="text"
          value={lastName}
          onChange={handleLastNameChange}
          disabled={disabled}
          className={lastNameError ? 'border-red-500' : ''}
          autoComplete="family-name"
        />
        {lastNameError && (
          <p className="text-sm text-red-500 mt-1">{lastNameError}</p>
        )}
      </div>
    </div>
  );
};
