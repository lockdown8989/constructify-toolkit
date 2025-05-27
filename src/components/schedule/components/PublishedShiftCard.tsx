
import React from 'react';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PublishedShiftCardProps {
  shift: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    location?: string;
    department?: string;
    shift_type?: string;
    published?: boolean;
    status?: string;
  };
  onClick?: () => void;
  onClaim?: () => void;
  showClaimButton?: boolean;
}

const PublishedShiftCard: React.FC<PublishedShiftCardProps> = ({ 
  shift, 
  onClick, 
  onClaim,
  showClaimButton = false 
}) => {
  const startTime = new Date(shift.start_time);
  const endTime = new Date(shift.end_time);
  const hours = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60) * 10) / 10;
  
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

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'sales associate': return 'bg-purple-400';
      case 'customer support': return 'bg-blue-600';
      case 'manager': return 'bg-red-500';
      case 'assistant': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow",
        shift.department?.toLowerCase() === 'sales' ? 'border-l-blue-500' : 
        shift.department?.toLowerCase() === 'customer service' ? 'border-l-orange-400' :
        'border-l-gray-400',
        onClick && !showClaimButton ? 'cursor-pointer' : ''
      )}
      onClick={!showClaimButton ? onClick : undefined}
    >
      {/* Header with date and status */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold">
          {format(startTime, 'EEE, MMM d')}
        </div>
        {shift.published && (
          <Badge className="bg-green-500 text-white">
            published
          </Badge>
        )}
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

      {/* Department and Role */}
      <div className="space-y-2 mb-3">
        {shift.department && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Department:</span>
            <Badge className={cn("text-white", getDepartmentColor(shift.department))}>
              {shift.department}
            </Badge>
          </div>
        )}
        
        {shift.shift_type && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Role:</span>
            <Badge className={cn("text-white", getRoleColor(shift.shift_type))}>
              {shift.shift_type}
            </Badge>
          </div>
        )}
      </div>

      {/* Location */}
      {shift.location && (
        <div className="flex items-center gap-2 text-gray-600 mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{shift.location}</span>
        </div>
      )}

      {/* Availability status */}
      <div className="text-sm text-gray-500 italic mb-3">
        Available for pickup
      </div>

      {/* Claim Button */}
      {showClaimButton && onClaim && (
        <Button 
          onClick={onClaim}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          Claim Shift
        </Button>
      )}
    </div>
  );
};

export default PublishedShiftCard;
