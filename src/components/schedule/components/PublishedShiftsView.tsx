
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { usePublishedShifts } from '@/hooks/use-published-shifts';
import ClaimableShiftCard from './ClaimableShiftCard';

const PublishedShiftsView: React.FC = () => {
  const { isEmployee } = useAuth();
  const { publishedShifts, isLoading, claimShift, isClaimingShift } = usePublishedShifts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading published shifts...</div>
      </div>
    );
  }

  if (publishedShifts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 flex flex-col items-center">
        <AlertCircle className="h-6 w-6 mb-2 text-gray-400" />
        <p>No open shifts available</p>
        <p className="text-sm mt-2">
          When managers publish open shifts, they'll appear here for you to claim
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {publishedShifts.map(shift => (
        <ClaimableShiftCard
          key={shift.id}
          shift={shift}
          onClaim={claimShift}
          isClaimingShift={isClaimingShift}
          canClaim={isEmployee}
        />
      ))}
    </div>
  );
};

export default PublishedShiftsView;
