
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import ShiftPatternSettings from '@/components/shift-patterns/ShiftPatternSettings';

const ShiftPatterns = () => {
  const { isAdmin, isManager, isHR } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;

  if (!hasManagerAccess) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access shift pattern management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <ShiftPatternSettings />
    </div>
  );
};

export default ShiftPatterns;
