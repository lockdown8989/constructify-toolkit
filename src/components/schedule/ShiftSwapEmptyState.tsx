
import React from 'react';

interface ShiftSwapEmptyStateProps {
  statusType: string;
}

const ShiftSwapEmptyState = ({ statusType }: ShiftSwapEmptyStateProps) => {
  return (
    <div className="text-center p-6 text-gray-500">
      No {statusType} shift swap requests found
    </div>
  );
};

export default ShiftSwapEmptyState;
