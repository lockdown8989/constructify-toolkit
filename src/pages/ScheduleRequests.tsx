
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShiftSwapList from '@/components/schedule/ShiftSwapList';
import ShiftSwapForm from '@/components/schedule/ShiftSwapForm';
import AvailabilityRequestList from '@/components/schedule/AvailabilityRequestList';
import AvailabilityRequestForm from '@/components/schedule/AvailabilityRequestForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';

const ScheduleRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<'requests' | 'form'>('requests');
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  
  // Set up real-time listeners for shift swaps and availability requests
  useEffect(() => {
    const channel = supabase
      .channel('schedule_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shift_swaps'
        },
        (payload) => {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
          
          // Show toast notification for specific events
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
              toast({
                title: "Shift swap approved",
                description: "A shift swap request has been approved.",
              });
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
              toast({
                title: "Shift swap rejected",
                description: "A shift swap request has been rejected.",
              });
            } else if (newStatus === 'Completed') {
              toast({
                title: "Shift swap completed",
                description: "A shift swap has been marked as completed.",
              });
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "New shift swap request",
              description: "A new shift swap request has been submitted.",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability_requests'
        },
        (payload) => {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
          
          // Show toast notification for specific events
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
              toast({
                title: "Availability request approved",
                description: "An availability request has been approved.",
              });
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
              toast({
                title: "Availability request rejected",
                description: "An availability request has been rejected.",
              });
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "New availability request",
              description: "A new availability request has been submitted.",
            });
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);
  
  const renderMobileNavigation = () => {
    if (!isMobile) return null;
    
    return (
      <div className="flex justify-center mb-4">
        <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as 'requests' | 'form')}>
          <TabsList>
            <TabsTrigger value="requests">View Requests</TabsTrigger>
            <TabsTrigger value="form">Create Request</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    );
  };
  
  return (
    <div className="container py-4 sm:py-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Schedule & Availability Management</h1>
      
      {renderMobileNavigation()}
      
      <Tabs defaultValue="shift-swaps">
        <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
          <TabsTrigger value="shift-swaps" className="text-xs sm:text-sm">Shift Swaps</TabsTrigger>
          <TabsTrigger value="availability" className="text-xs sm:text-sm">Availability Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="shift-swaps" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {(!isMobile || activeSection === 'form') && (
              <div className="md:col-span-1">
                <ShiftSwapForm />
              </div>
            )}
            
            {(!isMobile || activeSection === 'requests') && (
              <div className="md:col-span-2">
                <ShiftSwapList />
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="availability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {(!isMobile || activeSection === 'form') && (
              <div className="md:col-span-1">
                {showAvailabilityForm ? (
                  <AvailabilityRequestForm onClose={() => setShowAvailabilityForm(false)} />
                ) : (
                  <div className="h-10 flex justify-center">
                    <button 
                      onClick={() => setShowAvailabilityForm(true)}
                      className="bg-primary text-primary-foreground shadow hover:bg-primary/90 px-4 py-2 rounded-md"
                    >
                      Set Availability
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {(!isMobile || activeSection === 'requests') && (
              <div className="md:col-span-2">
                <AvailabilityRequestList />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScheduleRequests;
