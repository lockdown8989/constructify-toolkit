
import React from 'react';
import { useOpenShifts } from '@/hooks/use-open-shifts';
import { useAuth } from '@/hooks/use-auth';
import OpenShiftBlock from '@/components/restaurant/OpenShiftBlock';
import { Loader2, AlertCircle } from 'lucide-react';

const PublishedShiftsView: React.FC = () => {
  const { openShifts, isLoading } = useOpenShifts();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading available shifts...</span>
      </div>
    );
  }

  // Filter available shifts (not expired, not cancelled, not assigned)
  const availableShifts = openShifts.filter(shift => 
    shift.status !== 'expired' && 
    shift.status !== 'cancelled' && 
    shift.status !== 'assigned' &&
    !shift.isExpired
  );

  if (availableShifts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 flex flex-col items-center">
        <AlertCircle className="h-6 w-6 mb-2 text-gray-400" />
        <p>No open shifts available at the moment</p>
        <p className="text-sm mt-2">Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availableShifts.map((shift) => (
        <OpenShiftBlock
          key={shift.id}
          openShift={shift}
          employeeId={user?.id || ''}
          status="available"
        />
      ))}
    </div>
  );
};

export default PublishedShiftsView;
