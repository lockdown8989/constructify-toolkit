
import React from 'react';

interface ShiftSwapEmptyStateProps {
  statusType: string;
}

const ShiftSwapEmptyState: React.FC<ShiftSwapEmptyStateProps> = ({ statusType }) => {
  const getMessage = () => {
    switch (statusType) {
      case 'pending':
        return "No pending shift swap requests";
      case 'approved':
        return "No approved shift swap requests";
      case 'rejected':
        return "No rejected shift swap requests";
      case 'completed':
        return "No completed shift swap requests";
      default:
        return "No shift swap requests found";
    }
  };

  return (
    <div className="text-center py-8 text-gray-500">
      <p className="text-base">{getMessage()}</p>
      {statusType === 'pending' && (
        <p className="text-sm mt-2">
          Create a new shift swap request or check back later.
        </p>
      )}
    </div>
  );
};

export default ShiftSwapEmptyState;
