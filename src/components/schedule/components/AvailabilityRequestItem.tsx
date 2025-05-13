
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Check, X, FileEdit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AvailabilityRequest } from '@/types/availability';
import { useAuth } from '@/hooks/auth';
import StatusBadge from './StatusBadge';

type AvailabilityRequestItemProps = {
  request: AvailabilityRequest;
  onReview: (id: string) => void;
};

const AvailabilityRequestItem = ({ request, onReview }: AvailabilityRequestItemProps) => {
  const { isManager, isAdmin, isHR } = useAuth();
  const canReview = isManager || isAdmin || isHR;
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };
  
  // Format time (expects "HH:MM:SS" format)
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold flex items-center gap-2">
              {request.employees?.name || 'Employee'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {formatDate(request.date)} • {formatTime(request.start_time)} - {formatTime(request.end_time)}
            </div>
            {request.notes && (
              <p className="text-sm mt-2 text-muted-foreground">
                Note: {request.notes}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={request.status} />
            
            {canReview && request.status === 'Pending' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onReview(request.id)}
              >
                <FileEdit className="h-4 w-4 mr-1" />
                Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityRequestItem;
