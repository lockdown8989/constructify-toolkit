
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

const PayslipsPage = () => {
  const { isPayroll } = useAuth();
  
  // Only allow payroll users to access this page
  if (!isPayroll) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">This page is only accessible to payroll users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Payslips Management</h1>
        </div>
        <p className="text-muted-foreground">Manage and view employee payslips</p>
      </header>
      
      <Card className="p-6">
        <div className="text-center py-12">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Payslips Coming Soon</h3>
          <p className="text-muted-foreground">
            This feature is under development. You'll be able to manage employee payslips here.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PayslipsPage;
