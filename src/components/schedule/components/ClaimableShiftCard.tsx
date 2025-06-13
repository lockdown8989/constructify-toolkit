
import React from 'react';
import { format, isAfter, parseISO } from 'date-fns';
import { MapPin, Clock, User, Building, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PublishedShift } from '@/hooks/use-published-shifts';
import { useAuth } from '@/hooks/use-auth';

interface ClaimableShiftCardProps {
  shift: PublishedShift;
  onClaim: (shiftId: string) => void;
  isClaimingShift: boolean;
  canClaim: boolean;
}

const ClaimableShiftCard: React.FC<ClaimableShiftCardProps> = ({ 
  shift, 
  onClaim,
  isClaimingShift,
  canClaim
}) => {
  const { isEmployee, isManager, isAdmin, isHR } = useAuth();
  const startTime = new Date(shift.start_time);
  const endTime = new Date(shift.end_time);
  const hours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) * 10) / 10;
  
  // Check if shift is expired or has started
  const now = new Date();
  const isExpired = shift.expiration_date ? isAfter(now, parseISO(shift.expiration_date)) : false;
  const hasStarted = startTime <= now;
  const isUnavailable = isExpired || hasStarted;
  
  const getDepartmentColor = (department?: string) => {
    switch (department?.toLowerCase()) {
      case 'sales': return 'bg-blue-500';
      case 'customer service': return 'bg-orange-400';
      case 'marketing': return 'bg-purple-500';
      case 'operations': return 'bg-green-500';
      case 'hr': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getAccessMessage = () => {
    if (isUnavailable) {
      return hasStarted ? "This shift has already started" : "This shift has expired";
    }
    if (isManager || isAdmin || isHR) {
      return "Managers assign shifts to employees";
    }
    if (!isEmployee) {
      return "Only employees can claim shifts";
    }
    return null;
  };

  const getStatusBadge = () => {
    if (isUnavailable) {
      return (
        <Badge className="bg-red-500 text-white flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {hasStarted ? "Started" : "Expired"}
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500 text-white">
        published
      </Badge>
    );
  };

  return (
    <Card className={cn(
      "p-4 border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow",
      isUnavailable ? "border-l-red-500 opacity-60" : "border-l-green-500"
    )}>
      {/* Header with date and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">
          {format(startTime, 'EEE, MMM d')}
        </div>
        {getStatusBadge()}
      </div>

      {/* Time and Hours */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <div className="text-sm text-gray-500">Start</div>
          <div className="text-lg font-semibold">
            {format(startTime, 'hh:mm a')}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">End</div>
          <div className="text-lg font-semibold">
            {format(endTime, 'hh:mm a')}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Hours</div>
          <div className="text-lg font-semibold">{hours}</div>
        </div>
      </div>

      {/* Shift Details */}
      <div className="space-y-2 mb-3">
        <div className="text-lg font-medium">{shift.title}</div>
        
        {shift.department && (
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <Badge className={cn("text-white", getDepartmentColor(shift.department))}>
              {shift.department}
            </Badge>
          </div>
        )}
        
        {shift.role && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <Badge className="bg-purple-400 text-white">
              {shift.role}
            </Badge>
          </div>
        )}

        {shift.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{shift.location}</span>
          </div>
        )}
      </div>

      {/* Availability status */}
      <div className="text-sm text-gray-500 italic mb-3">
        {isUnavailable 
          ? (hasStarted ? "Shift has already started" : "Shift has expired")
          : "Available for pickup"
        }
      </div>

      {/* Claim Button - Only show for employees and if not unavailable */}
      {canClaim && isEmployee && !isUnavailable && (
        <Button 
          onClick={() => onClaim(shift.id)}
          disabled={isClaimingShift}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {isClaimingShift ? 'Claiming...' : 'Claim Shift'}
        </Button>
      )}

      {(isUnavailable || !canClaim) && (
        <div className="text-center text-sm text-gray-500 py-2">
          {getAccessMessage()}
        </div>
      )}
    </Card>
  );
};

export default ClaimableShiftCard;
