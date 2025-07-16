// Sign up form component
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthFormData } from '@/lib/auth/types';
import { validateSignUpForm } from '@/lib/auth/validation';
import { AccountTypeSelector } from '../components/AccountTypeSelector';
import { useUserRole, UserRole } from '../hooks/useUserRole';

interface SignUpFormProps {
  onSubmit: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  isLoading?: boolean;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Role management
  const { userRole, handleRoleChange, managerId, setManagerId, generateManagerId } = useUserRole();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
    watch,
  } = useForm<AuthFormData>();

  const password = watch('password');

  const handleFormSubmit = async (data: AuthFormData) => {
    setError(null);
    setSubmitLoading(true);

    try {
      // Validate form
      const validation = validateSignUpForm(data);
      if (!validation.isValid) {
        Object.entries(validation.errors).forEach(([field, message]) => {
          setFieldError(field as keyof AuthFormData, { message });
        });
        return;
      }

      // Submit form
      const result = await onSubmit(
        data.email,
        data.password,
        data.firstName || '',
        data.lastName || ''
      );
      
      if (!result?.success && result?.message) {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up form error:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const isFormLoading = isLoading || submitLoading;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="First name"
            disabled={isFormLoading}
            {...register('firstName', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
            })}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Last name"
            disabled={isFormLoading}
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
            })}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          disabled={isFormLoading}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address',
            },
          })}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            disabled={isFormLoading}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isFormLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Password must contain uppercase, lowercase, number, and special character
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            disabled={isFormLoading}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isFormLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Account Type Selection */}
      <AccountTypeSelector 
        userRole={userRole}
        onRoleChange={handleRoleChange}
        disabled={isFormLoading}
      />

      {/* Manager ID Field - Only show for managers */}
      {userRole === 'manager' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Manager ID</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateManagerId}
              disabled={isFormLoading}
            >
              Generate ID
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Enter or generate manager ID"
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            disabled={isFormLoading}
          />
          <p className="text-xs text-muted-foreground">
            Manager ID is required for manager accounts
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isFormLoading}>
        {isFormLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
};