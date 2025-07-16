import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import SingleShiftSchedule from '@/components/restaurant/SingleShiftSchedule';

const RestaurantSchedule = () => {
  const { isAdmin, isManager, isHR } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;

  if (!hasManagerAccess) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access restaurant schedule management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Restaurant Schedule</h1>
        <p className="text-gray-600 mt-2">Manage single shifts, open shifts, and ad-hoc scheduling</p>
      </div>
      <SingleShiftSchedule />
    </div>
  );
};

export default RestaurantSchedule;
