
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { Card, CardContent } from '@/components/ui/card';
import CurrentDateTime from './CurrentDateTime';

const DashboardHeader = () => {
  const { user } = useAuth();
  const firstName = user?.user_metadata?.first_name || 'User';

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {firstName}</h1>
          <p className="text-gray-500">Your dashboard overview</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <CurrentDateTime />
        </div>
      </div>
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <p className="text-sm">Access your schedule, clock in/out, and manage your shifts all in one place.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHeader;
