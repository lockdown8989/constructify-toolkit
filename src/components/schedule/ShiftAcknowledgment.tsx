
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface AcknowledgedShift {
  schedule_id: string;
  acknowledged_at: string;
  status: 'acknowledged' | 'declined' | 'pending';
  notes?: string;
}

const ShiftAcknowledgment = ({ schedules, employeeNames }: { 
  schedules: Schedule[];
  employeeNames: Record<string, string>;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [acknowledgedShifts, setAcknowledgedShifts] = useState<Record<string, AcknowledgedShift>>({});
  
  // Filter for upcoming shifts (in the next 7 days)
  const now = new Date();
  const upcomingShifts = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    const dateDiff = Math.floor((scheduleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return dateDiff >= 0 && dateDiff <= 7; // Next 7 days
  });
  
  // Sort by date
  const sortedShifts = [...upcomingShifts].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );
  
  const handleAcknowledge = async (scheduleId: string, status: 'acknowledged' | 'declined') => {
    if (!user) return;
    
    try {
      // In a real app, this would be stored in the database
      const acknowledgement: AcknowledgedShift = {
        schedule_id: scheduleId,
        acknowledged_at: new Date().toISOString(),
        status: status
      };
      
      // For now, just store in state
      setAcknowledgedShifts(prev => ({
        ...prev,
        [scheduleId]: acknowledgement
      }));
      
      // Trigger a toast notification
      toast({
        title: status === 'acknowledged' ? "Shift Acknowledged" : "Shift Declined",
        description: `You have ${status} the shift.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      
    } catch (error) {
      console.error("Error acknowledging shift:", error);
      toast({
        title: "Error",
        description: "Failed to acknowledge shift. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (sortedShifts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p>No upcoming shifts in the next 7 days</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {sortedShifts.map(shift => {
            const startTime = new Date(shift.start_time);
            const endTime = new Date(shift.end_time);
            const isAcknowledged = acknowledgedShifts[shift.id]?.status === 'acknowledged';
            const isDeclined = acknowledgedShifts[shift.id]?.status === 'declined';
            
            return (
              <div 
                key={shift.id} 
                className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">
                      {format(startTime, 'EEEE, MMM d')}
                    </span>
                  </div>
                  
                  {isAcknowledged && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Acknowledged
                    </Badge>
                  )}
                  
                  {isDeclined && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Declined
                    </Badge>
                  )}
                </div>
                
                <div className="ml-6 space-y-1 mb-3">
                  <div className="text-sm">
                    <Clock className="h-3.5 w-3.5 inline mr-1 text-gray-400" />
                    {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                  </div>
                  <div className="text-sm font-medium">{shift.title}</div>
                </div>
                
                {!isAcknowledged && !isDeclined && (
                  <div className="flex gap-2 justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-green-600" 
                      onClick={() => handleAcknowledge(shift.id, 'acknowledged')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600" 
                      onClick={() => handleAcknowledge(shift.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftAcknowledgment;
