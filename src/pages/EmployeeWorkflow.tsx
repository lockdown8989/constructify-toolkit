
import React from 'react';
import { useAuth } from '@/hooks/auth';
import { Navigate } from 'react-router-dom';
import EmployeeScheduleView from '@/components/schedule/EmployeeScheduleView';

const EmployeeWorkflow = () => {
  const { user, isManager, isAdmin, isHR } = useAuth();
  
  // Regular employees should be redirected to the main schedule page
  if (!isManager && !isAdmin && !isHR) {
    return <Navigate to="/schedule" replace />;
  }
  
  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">My Schedule</h1>
        <p>Please sign in to access your schedule.</p>
      </div>
    );
  }
  
  return <EmployeeScheduleView />;
};

export default EmployeeWorkflow;
