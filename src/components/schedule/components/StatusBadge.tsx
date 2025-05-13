
import React from 'react';
import { AvailabilityStatus } from '@/types/availability';

interface StatusBadgeProps {
  status: AvailabilityStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClasses = () => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center ${getBadgeClasses()}`}>
      {status}
    </div>
  );
};

export default StatusBadge;
