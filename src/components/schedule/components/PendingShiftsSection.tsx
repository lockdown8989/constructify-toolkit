
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import PendingShiftCard from './PendingShiftCard';

interface PendingShiftsSectionProps {
  pendingShifts: Schedule[];
  onResponseComplete?: () => void;
}

const PendingShiftsSection: React.FC<PendingShiftsSectionProps> = ({ 
  pendingShifts, 
  onResponseComplete 
}) => {
  if (pendingShifts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-800 text-lg">
              Pending Shift Responses Required
            </h3>
            <p className="text-sm text-orange-600 mt-1">
              You have {pendingShifts.length} shift{pendingShifts.length > 1 ? 's' : ''} waiting for your response
            </p>
          </div>
        </div>
        
        <div className="space-y-3">
          {pendingShifts.map(shift => (
            <PendingShiftCard
              key={shift.id}
              schedule={shift}
              onResponseComplete={onResponseComplete}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PendingShiftsSection;
