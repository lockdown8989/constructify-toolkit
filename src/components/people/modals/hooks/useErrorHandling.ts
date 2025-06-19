
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useErrorHandling = () => {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleError = (err: unknown, defaultMessage: string) => {
    console.error('❌ Error:', err);
    
    let errorMessage = defaultMessage;
    
    if (err instanceof Error) {
      errorMessage = err.message;
      console.error('Error details:', err);
    }

    // Handle specific database errors
    if (errorMessage.includes('violates check constraint')) {
      errorMessage = 'Invalid data format. Please check your input values.';
    } else if (errorMessage.includes('duplicate key')) {
      errorMessage = 'An employee with this information already exists.';
    }
    
    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};
