
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSecurityValidation } from '@/hooks/security/useSecurityValidation';

interface SecureManagerIdInputProps {
  managerId: string;
  onManagerIdChange: (managerId: string) => void;
  onGenerate: () => void;
  userRole: string;
  disabled?: boolean;
}

export const SecureManagerIdInput: React.FC<SecureManagerIdInputProps> = ({
  managerId,
  onManagerIdChange,
  onGenerate,
  userRole,
  disabled
}) => {
  const { validateManagerId } = useSecurityValidation();
  const [managerIdError, setManagerIdError] = useState<string>('');

  const handleManagerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validation = validateManagerId(value);
    
    if (validation.isValid || value === '') {
      onManagerIdChange(validation.sanitizedValue);
      setManagerIdError('');
    } else {
      onManagerIdChange(value); // Keep original for user to see
      setManagerIdError(validation.errors[0]);
    }
  };

  if (userRole !== 'manager' && userRole !== 'employee') {
    return null;
  }

  return (
    <div>
      <Label htmlFor="managerId">
        {userRole === 'manager' ? 'Your Manager ID' : 'Manager ID (Optional)'}
      </Label>
      <div className="flex gap-2">
        <Input
          id="managerId"
          type="text"
          value={managerId}
          onChange={handleManagerIdChange}
          disabled={disabled}
          className={managerIdError ? 'border-red-500' : ''}
          placeholder={userRole === 'manager' ? 'Generate or enter your ID' : 'Enter your manager\'s ID'}
          autoComplete="off"
        />
        {userRole === 'manager' && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onGenerate}
            disabled={disabled}
            title="Generate Manager ID"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      {managerIdError && (
        <p className="text-sm text-red-500 mt-1">{managerIdError}</p>
      )}
      {userRole === 'employee' && (
        <p className="text-sm text-gray-500 mt-1">
          Enter your manager's ID if you know it, or leave empty to add later.
        </p>
      )}
    </div>
  );
};
