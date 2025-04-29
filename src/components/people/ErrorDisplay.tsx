
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  title = 'Error',
  onRetry
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="py-6 px-4 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg flex flex-col items-center text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <div className="mb-4">
          {title && <div className="font-medium text-lg mb-1">{title}</div>}
          <span className="text-red-700">{errorMessage}</span>
        </div>
        
        {onRetry && (
          <Button 
            variant="outline"
            className="mt-2 bg-white border-red-200 hover:bg-red-50"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
