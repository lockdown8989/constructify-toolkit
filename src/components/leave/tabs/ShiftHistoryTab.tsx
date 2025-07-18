
import React, { useState } from 'react';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import ShiftDetailCard from '@/components/schedule/ShiftDetailCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Info, RefreshCw, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isAfter, subMonths } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ShiftHistoryTab = () => {
  const { schedules, isLoading, refetch } = useEmployeeSchedule();
  const { user, isManager } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedShift, setSelectedShift] = useState(null);
  
  // Filter schedules for responded ones (confirmed, completed or rejected)
  const respondedSchedules = schedules?.filter(s => 
    s.status === 'confirmed' || s.status === 'completed' || s.status === 'rejected'
  ) || [];

  // Sort schedules by date (most recent first)
  const sortedSchedules = [...respondedSchedules].sort((a, b) => 
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );
  
  // Filter out schedules older than one month
  const oneMonthAgo = subMonths(new Date(), 1);
  const recentSchedules = sortedSchedules.filter(schedule => 
    isAfter(parseISO(schedule.start_time), oneMonthAgo)
  );
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Shift history has been updated",
    });
  };

  const handleViewDetails = (schedule) => {
    setSelectedShift(schedule);
  };

  const handleContactManager = (schedule) => {
    // Create mailto link with shift details
    const subject = `Regarding shift on ${format(parseISO(schedule.start_time), 'MMM d, yyyy')}`;
    const body = `Hi,\n\nI have a question about my shift:\n\nDate: ${format(parseISO(schedule.start_time), 'MMM d, yyyy')}\nTime: ${format(parseISO(schedule.start_time), 'h:mm a')} - ${format(parseISO(schedule.end_time), 'h:mm a')}\nShift: ${schedule.title}\n\nMessage:\n\n`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Opening email client",
      description: "A new email has been prepared for your manager",
    });
  };

  const handleCancel = () => {
    toast({
      title: "Information",
      description: "Historical shifts cannot be cancelled",
      variant: "destructive"
    });
  };
  
  return (
    <div className={isMobile ? 'px-4' : ''}>
      <Card className={`border shadow-sm ${isMobile ? 'mx-0 rounded-lg' : ''}`}>
        <CardHeader className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row items-center justify-between'} border-b ${isMobile ? 'pb-4 px-4' : 'pb-3'}`}>
          <CardTitle className={`flex items-center ${isMobile ? 'text-base' : 'text-lg'}`}>
            <History className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-primary`} />
            Shift History
            <span className={`ml-2 ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground font-normal`}>
              (last 30 days)
            </span>
          </CardTitle>
          <Button 
            variant="outline" 
            size={isMobile ? 'sm' : 'sm'} 
            onClick={handleRefresh}
            className={isMobile ? 'w-full sm:w-auto' : ''}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-4 pt-4' : 'pt-4'}`}>
          {isLoading ? (
            <div className={`flex items-center justify-center ${isMobile ? 'py-6' : 'py-8'}`}>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : recentSchedules.length === 0 ? (
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} text-gray-500 flex flex-col items-center`}>
              <Info className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-muted-foreground mb-2 opacity-50`} />
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                No shift history available
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
                Completed and rejected shifts from the last 30 days will appear here
              </p>
            </div>
          ) : (
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              {recentSchedules.map(schedule => (
                <div key={schedule.id}>
                  <ShiftDetailCard
                    schedule={schedule}
                    onInfoClick={() => handleViewDetails(schedule)}
                    onEmailClick={() => handleContactManager(schedule)}
                    onCancelClick={handleCancel}
                  />
                  <div className={`mt-1 ${isMobile ? 'text-xs' : 'text-xs'} text-right text-muted-foreground`}>
                    Status: {schedule.status} • Updated: {format(parseISO(schedule.updated_at || schedule.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shift Details Dialog */}
      <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
        <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' : 'max-w-2xl'}`}>
          <DialogHeader>
            <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
              Shift Details
            </DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className={`space-y-4 ${isMobile ? 'text-sm' : ''}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Date</h4>
                  <p>{format(parseISO(selectedShift.start_time), 'EEEE, MMMM d, yyyy')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Status</h4>
                  <p className="capitalize">{selectedShift.status || 'confirmed'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Start Time</h4>
                  <p className="text-lg">{format(parseISO(selectedShift.start_time), 'h:mm a')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">End Time</h4>
                  <p className="text-lg">{format(parseISO(selectedShift.end_time), 'h:mm a')}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Duration</h4>
                  <p className="text-lg">{Math.round((new Date(selectedShift.end_time).getTime() - new Date(selectedShift.start_time).getTime()) / (1000 * 60 * 60) * 10) / 10} hrs</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700">Shift Title</h4>
                <p>{selectedShift.title}</p>
              </div>

              {selectedShift.location && (
                <div>
                  <h4 className="font-semibold text-gray-700">Location</h4>
                  <p>{selectedShift.location}</p>
                </div>
              )}

              {selectedShift.notes && (
                <div>
                  <h4 className="font-semibold text-gray-700">Notes</h4>
                  <p className="text-gray-600">{selectedShift.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Created</h4>
                  <p>{format(parseISO(selectedShift.created_at), 'MMM d, yyyy h:mm a')}</p>
                </div>
                {selectedShift.updated_at && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Last Updated</h4>
                    <p>{format(parseISO(selectedShift.updated_at), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                )}
              </div>

              <div className={`flex gap-2 pt-4 ${isMobile ? 'flex-col' : ''}`}>
                <Button 
                  onClick={() => handleContactManager(selectedShift)} 
                  className={`${isMobile ? 'w-full' : 'flex-1'}`}
                  variant="outline"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Manager
                </Button>
                <Button 
                  onClick={() => setSelectedShift(null)} 
                  className={`${isMobile ? 'w-full' : 'flex-1'}`}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiftHistoryTab;
