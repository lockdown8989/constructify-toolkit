
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Info, Mail, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Schedule } from '@/hooks/use-schedules';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShiftDetailCardProps {
  schedule: Schedule;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
  onResponseComplete?: () => void;
}

const ShiftDetailCard: React.FC<ShiftDetailCardProps> = ({
  schedule,
  onInfoClick,
  onEmailClick,
  onCancelClick,
  onResponseComplete
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Format dates
  const startDate = new Date(schedule.start_time);
  const endDate = new Date(schedule.end_time);
  
  // Calculate shift duration
  const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
  
  const handleResponse = async (accept: boolean) => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase
        .from('schedules')
        .update({
          status: accept ? 'confirmed' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id)
        .select();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: accept ? "Shift Accepted" : "Shift Declined",
        description: accept ? 
          "You have successfully accepted the shift." : 
          "You have declined the shift.",
        variant: accept ? "default" : "destructive",
      });
      
      if (onResponseComplete) {
        onResponseComplete();
      }
      
    } catch (error) {
      console.error('Error responding to shift:', error);
      toast({
        title: "Error",
        description: "Failed to respond to shift request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden",
      schedule.status === 'pending' ? "border-amber-300" : "",
      schedule.status === 'confirmed' ? "border-green-300" : "",
      schedule.status === 'rejected' ? "border-red-300" : ""
    )}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{schedule.title}</h3>
            <div className="flex items-center text-gray-600 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center text-gray-600 mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                <span className="text-gray-500 ml-1">({durationHours.toFixed(1)} hrs)</span>
              </span>
            </div>
          </div>
          
          <Badge className={cn(
            "text-xs",
            schedule.status === 'pending' ? "bg-amber-100 text-amber-800 border-amber-200" : 
            schedule.status === 'confirmed' ? "bg-green-100 text-green-800 border-green-200" : 
            schedule.status === 'rejected' ? "bg-red-100 text-red-800 border-red-200" : 
            "bg-gray-100 text-gray-800 border-gray-200"
          )}>
            {schedule.status === 'pending' ? 'Needs Response' : 
             schedule.status === 'confirmed' ? 'Confirmed' :
             schedule.status === 'rejected' ? 'Rejected' :
             schedule.status}
          </Badge>
        </div>
        
        {schedule.location && (
          <div className="mt-2 text-sm text-gray-600">
            Location: {schedule.location}
          </div>
        )}
        
        {schedule.notes && (
          <div className="mt-2 text-sm text-gray-600">
            Notes: {schedule.notes}
          </div>
        )}
        
        {/* Response buttons for pending shifts */}
        {schedule.status === 'pending' && (
          <div className="mt-4 flex justify-end space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => handleResponse(true)}
              disabled={isSubmitting}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => handleResponse(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        )}
        
        {/* Action buttons for confirmed shifts */}
        {schedule.status === 'confirmed' && (
          <div className="mt-4 flex justify-end space-x-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onInfoClick}
            >
              <Info className="h-4 w-4 mr-1" />
              Details
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={onEmailClick}
            >
              <Mail className="h-4 w-4 mr-1" />
              Contact
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ShiftDetailCard;
