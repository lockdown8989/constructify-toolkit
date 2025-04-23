
import React from 'react';
import { OpenShift } from '@/types/restaurant-schedule';
import { useAuth } from '@/hooks/use-auth';
import OpenShiftResponseActions from './OpenShiftResponseActions';
import { Card } from '@/components/ui/card';

interface OpenShiftBlockProps {
  openShift: OpenShift;
  employeeId?: string;
  handleAssignOpenShift?: (openShiftId: string, employeeId?: string) => void;
  compact?: boolean;
  position?: number;
}

const OpenShiftBlock = ({ 
  openShift, 
  employeeId,
  handleAssignOpenShift,
  compact = false,
  position 
}: OpenShiftBlockProps) => {
  const { user } = useAuth();

  return (
    <Card className="p-3 mb-2 bg-orange-50 border-orange-200">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-sm">{openShift.title}</h4>
          <p className="text-xs text-gray-600">
            {new Date(openShift.start_time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} - {new Date(openShift.end_time).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          {openShift.role && (
            <p className="text-xs text-gray-500">Role: {openShift.role}</p>
          )}
        </div>
        
        {employeeId && user && (
          <OpenShiftResponseActions 
            shift={openShift}
            employeeId={employeeId}
          />
        )}
      </div>
      
      {openShift.notes && (
        <p className="text-xs text-gray-600 mt-2">{openShift.notes}</p>
      )}
    </Card>
  );
};

export default OpenShiftBlock;
