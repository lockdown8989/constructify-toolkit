
import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Security notice component to inform users about security best practices
 */
const SecurityNotice: React.FC = () => {
  return (
    <div className="space-y-3">
      <Alert className="border-blue-200 bg-blue-50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Security Notice:</strong> Your account is protected with advanced security measures. 
          Please use a strong, unique password and verify your email address.
        </AlertDescription>
      </Alert>
      
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Account Security:</strong> Never share your login credentials. 
          We will never ask for your password via email or phone.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SecurityNotice;
