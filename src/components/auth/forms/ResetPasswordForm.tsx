// Reset password form component
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/auth/AuthContext';
import { validateResetPasswordForm } from '@/lib/auth/validation';

interface ResetPasswordFormProps {
  onBack: () => void;
}

interface FormData {
  email: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFieldError,
  } = useForm<FormData>();

  const handleFormSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Validate form
      const validation = validateResetPasswordForm(data.email);
      if (!validation.isValid) {
        Object.entries(validation.errors).forEach(([field, message]) => {
          setFieldError(field as keyof FormData, { message });
        });
        return;
      }

      // Submit reset request
      const result = await resetPassword(data.email);
      
      if (result.success) {
        setIsSuccess(true);
      } else if (result.message) {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-green-600" />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-muted-foreground">
            We've sent a password reset link to your email address. 
            Click the link in the email to reset your password.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          
          <Button
            variant="outline"
            onClick={() => {
              setIsSuccess(false);
              setError(null);
            }}
            className="w-full"
          >
            Try again
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={onBack}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Reset your password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <Button
        variant="ghost"
        onClick={onBack}
        className="w-full"
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to sign in
      </Button>
    </div>
  );
};