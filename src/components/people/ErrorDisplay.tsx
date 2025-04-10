
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center text-red-700">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>Error loading employees: {error.message}</span>
      </div>
    </div>
  );
};

export default ErrorDisplay;
