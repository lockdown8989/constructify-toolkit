
import React from 'react';
import { OpenShift } from '@/types/restaurant-schedule';
import { useAuth } from '@/hooks/use-auth';
import OpenShiftResponseActions from './OpenShiftResponseActions';
import { Card } from '@/components/ui/card';
import { AlertCircle, Clock, User, MapPin, Mail } from 'lucide-react';
import { format, isAfter, parseISO, formatDistanceStrict } from 'date-fns';

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

  // Get day and date for the shift
  const getShiftDay = () => {
    const date = new Date(openShift.start_time);
    return format(date, 'EEE').toUpperCase();
  };

  const getShiftDate = () => {
    const date = new Date(openShift.start_time);
    return format(date, 'd');
  };

  const getShiftMonth = () => {
    const date = new Date(openShift.start_time);
    return format(date, 'MMM').toUpperCase();
  };

  // Calculate shift duration
  const calculateDuration = () => {
    const start = new Date(openShift.start_time);
    const end = new Date(openShift.end_time);
    return formatDistanceStrict(start, end, { unit: 'hour' });
  };

  return (
    <Card className={`mb-3 overflow-hidden border border-gray-200 rounded-lg ${isExpired ? 'opacity-60' : ''}`}>
      <div className="flex">
        {/* Left sidebar with day/date */}
        <div className="bg-blue-500 text-white p-3 flex flex-col items-center justify-center min-w-[70px]">
          <div className="text-xl font-medium">{getShiftDay()}</div>
          <div className="text-3xl font-bold">{getShiftDate()}</div>
          <div className="text-sm">{getShiftMonth()}</div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-3">
          <div className="grid grid-cols-[1fr,auto] gap-2">
            <div>
              {/* Time and Duration */}
              <div className="flex items-center">
                <span className="text-xl font-bold">
                  {format(new Date(openShift.start_time), 'HH:mm')}
                </span>
                <span className="mx-2 text-xl">→</span>
                <span className="text-xl font-bold">
                  {format(new Date(openShift.end_time), 'HH:mm')}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {calculateDuration()}
              </div>
              
              {/* Role */}
              {openShift.role && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <User className="h-3.5 w-3.5 mr-1" />
                  {openShift.role}
                </div>
              )}
              
              {/* Location */}
              {openShift.location && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {openShift.location}
                </div>
              )}
            </div>
            
            <div className="flex flex-col justify-between items-end">
              <button className="text-gray-500 p-1">
                <Mail className="h-5 w-5" />
              </button>
              
              {employeeId && user && !isExpired && (
                <OpenShiftResponseActions 
                  shift={openShift}
                  employeeId={employeeId}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OpenShiftBlock;
