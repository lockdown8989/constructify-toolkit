
import React from 'react';
import { OpenShift } from '@/types/restaurant-schedule';
import { useAuth } from '@/hooks/use-auth';
import OpenShiftResponseActions from './OpenShiftResponseActions';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';

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
  
  // Check if the shift has expired
  const isExpired = openShift.expiration_date 
    ? isAfter(new Date(), parseISO(openShift.expiration_date))
    : false;

  // Display remaining time until expiration
  const getRemainingTime = () => {
    if (!openShift.expiration_date) return null;
    
    const now = new Date();
    const expiration = parseISO(openShift.expiration_date);
    
    if (isAfter(now, expiration)) {
      return 'Expired';
    }
    
    const diffMs = expiration.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `Expires in ${diffDays}d ${diffHours}h`;
    } else {
      return `Expires in ${diffHours}h`;
    }
  };

  return (
    <Card className={`p-3 mb-2 ${isExpired ? 'bg-gray-100 border-gray-200' : 'bg-orange-50 border-orange-200'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className={`font-medium text-sm ${isExpired ? 'text-gray-500' : ''}`}>{openShift.title}</h4>
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
          
          {openShift.expiration_date && (
            <p className={`text-xs mt-1 flex items-center ${isExpired ? 'text-red-500' : 'text-amber-600'}`}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {getRemainingTime()}
            </p>
          )}
        </div>
        
        {employeeId && user && !isExpired && (
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
