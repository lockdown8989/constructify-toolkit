import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export const useRetryLogic = (options: RetryOptions = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const { toast } = useToast();

  const calculateDelay = useCallback((attemptCount: number) => {
    const delay = baseDelay * Math.pow(backoffFactor, attemptCount);
    return Math.min(delay, maxDelay);
  }, [baseDelay, backoffFactor, maxDelay]);

  const retryOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          const delay = calculateDelay(attempt - 1);
          
          // Show retry notification
          toast({
            title: "Retrying Operation",
            description: `Attempt ${attempt + 1} of ${maxRetries + 1}${context ? ` - ${context}` : ''}`,
            duration: 2000,
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await operation();
        
        // Reset failure count on success
        setFailureCount(0);
        setIsRetrying(false);
        
        if (attempt > 0) {
          toast({
            title: "Operation Successful",
            description: "The operation completed successfully after retrying.",
          });
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        setFailureCount(attempt + 1);
        
        // Don't wait after the last attempt
        if (attempt === maxRetries) {
          setIsRetrying(false);
          break;
        }
      }
    }

    // All attempts failed
    setIsRetrying(false);
    
    toast({
      title: "Operation Failed",
      description: `Failed after ${maxRetries + 1} attempts. Please try again later.`,
      variant: "destructive",
    });
    
    throw lastError;
  }, [maxRetries, calculateDelay, toast]);

  const resetFailureCount = useCallback(() => {
    setFailureCount(0);
  }, []);

  return {
    retryOperation,
    isRetrying,
    failureCount,
    resetFailureCount,
    canRetry: failureCount < maxRetries
  };
};