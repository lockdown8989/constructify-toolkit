
// Authentication page header
import React from 'react';
import { Shield } from 'lucide-react';

export const AuthHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-primary" />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-2">
        TeamPulse
      </h1>
      
      <p className="text-muted-foreground mb-1">
        HR Management Platform
      </p>
      
      <p className="text-sm text-muted-foreground">
        Streamline your workforce management with powerful tools
      </p>
    </div>
  );
};
