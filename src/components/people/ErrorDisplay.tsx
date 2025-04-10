
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  title = 'Error' 
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="pt-6 pb-4 px-4 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <div>
          {title && <div className="font-medium">{title}</div>}
          <span>{errorMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
