import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  RefreshCw, 
  Plus, 
  Filter, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeftRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ShiftSwapList from '@/components/schedule/ShiftSwapList';
import ShiftSwapForm from '@/components/schedule/ShiftSwapForm';
import AvailabilityRequestList from '@/components/schedule/AvailabilityRequestList';
import AvailabilityRequestForm from '@/components/schedule/AvailabilityRequestForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getManagerUserIds } from '@/services/notifications/role-utils';
import { sendNotification } from '@/services/notifications';
import { useLocation } from 'react-router-dom';

const ScheduleRequestsTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user, isManager } = useAuth();
  const [activeSection, setActiveSection] = useState<'requests' | 'form'>('requests');
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [pendingCount, setPendingCount] = useState({ shifts: 0, availability: 0 });
  const location = useLocation();

  useEffect(() => {
    if (!user) return;
    
    const fetchPendingCounts = async () => {
      try {
        const { data: pendingShifts, error: shiftError } = await supabase
          .from('shift_swaps')
          .select('id', { count: 'exact' })
          .eq('status', 'Pending');
        
        const { data: pendingAvailability, error: availError } = await supabase
          .from('availability_requests')
          .select('id', { count: 'exact' })
          .eq('status', 'Pending');
        
        if (shiftError || availError) {
          console.error("Error fetching pending counts:", shiftError || availError);
          return;
        }
        
        setPendingCount({
          shifts: pendingShifts?.length || 0,
          availability: pendingAvailability?.length || 0
        });
      } catch (error) {
        console.error("Error in fetchPendingCounts:", error);
      }
    };
    
    fetchPendingCounts();
  }, [user, queryClient]);
  
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('schedule_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shift_swaps'
        },
        async (payload) => {
          queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
          
          const { data: pendingShifts } = await supabase
            .from('shift_swaps')
            .select('id', { count: 'exact' })
            .eq('status', 'Pending');
          
          setPendingCount(prev => ({
            ...prev,
            shifts: pendingShifts?.length || 0
          }));
          
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
              toast({
                title: "Shift swap approved",
                description: "A shift swap request has been approved.",
              });
              
              if (payload.new.requester_id && user.id !== payload.new.requester_id) {
                try {
                  await sendNotification({
                    user_id: payload.new.requester_id,
                    title: "Shift swap approved",
                    message: "Your shift swap request has been approved.",
                    type: "success",
                    related_entity: "shift_swaps",
                    related_id: payload.new.id
                  });
                } catch (error) {
                  console.error("Error sending notification:", error);
                }
              }
              
              if (payload.new.recipient_id && user.id !== payload.new.recipient_id) {
                try {
                  await sendNotification({
                    user_id: payload.new.recipient_id,
                    title: "New shift assigned",
                    message: "A shift has been assigned to you through a swap.",
                    type: "info",
                    related_entity: "shift_swaps",
                    related_id: payload.new.id
                  });
                } catch (error) {
                  console.error("Error sending notification:", error);
                }
              }
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
              toast({
                title: "Shift swap rejected",
                description: "A shift swap request has been rejected.",
              });
              
              if (payload.new.requester_id && user.id !== payload.new.requester_id) {
                try {
                  await sendNotification({
                    user_id: payload.new.requester_id,
                    title: "Shift swap rejected",
                    message: "Your shift swap request has been rejected.",
                    type: "warning",
                    related_entity: "shift_swaps",
                    related_id: payload.new.id
                  });
                } catch (error) {
                  console.error("Error sending notification:", error);
                }
              }
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
            
            try {
              const managerIds = await getManagerUserIds();
              
              for (const managerId of managerIds) {
                if (managerId !== user.id) {
                  await sendNotification({
                    user_id: managerId,
                    title: "New shift swap request",
                    message: "A new shift swap request requires your review.",
                    type: "info",
                    related_entity: "shift_swaps",
                    related_id: payload.new.id
                  });
                }
              }
            } catch (error) {
              console.error("Error sending notifications to managers:", error);
            }
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
        async (payload) => {
          queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
          
          const { data: pendingAvailability } = await supabase
            .from('availability_requests')
            .select('id', { count: 'exact' })
            .eq('status', 'Pending');
          
          setPendingCount(prev => ({
            ...prev,
            availability: pendingAvailability?.length || 0
          }));
          
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status;
            const oldStatus = payload.old.status;
            
            if (oldStatus === 'Pending' && newStatus === 'Approved') {
              toast({
                title: "Availability request approved",
                description: "An availability request has been approved.",
              });
              
              if (payload.new.employee_id && user.id !== payload.new.employee_id) {
                try {
                  await sendNotification({
                    user_id: payload.new.employee_id,
                    title: "Availability request approved",
                    message: "Your availability request has been approved.",
                    type: "success",
                    related_entity: "availability_requests",
                    related_id: payload.new.id
                  });
                } catch (error) {
                  console.error("Error sending notification:", error);
                }
              }
            } else if (oldStatus === 'Pending' && newStatus === 'Rejected') {
              toast({
                title: "Availability request rejected",
                description: "An availability request has been rejected.",
              });
              
              if (payload.new.employee_id && user.id !== payload.new.employee_id) {
                try {
                  await sendNotification({
                    user_id: payload.new.employee_id,
                    title: "Availability request rejected",
                    message: "Your availability request has been rejected.",
                    type: "warning",
                    related_entity: "availability_requests",
                    related_id: payload.new.id
                  });
                } catch (error) {
                  console.error("Error sending notification:", error);
                }
              }
            }
          } else if (payload.eventType === 'INSERT') {
            toast({
              title: "New availability request",
              description: "A new availability request has been submitted.",
            });
            
            try {
              const managerIds = await getManagerUserIds();
              
              for (const managerId of managerIds) {
                if (managerId !== user.id) {
                  await sendNotification({
                    user_id: managerId,
                    title: "New availability request",
                    message: "A new availability request requires your review.",
                    type: "info",
                    related_entity: "availability_requests",
                    related_id: payload.new.id
                  });
                }
              }
            } catch (error) {
              console.error("Error sending notifications to managers:", error);
            }
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, user]);
  
  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
    queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
    setLastRefreshed(new Date());
    toast({
      title: "Data refreshed",
      description: "Schedule request data has been refreshed."
    });
  };
  
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
    <Card className="border shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Schedule Requests</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Manage shift swaps and availability requests
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isManager && (pendingCount.shifts > 0 || pendingCount.availability > 0) && (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-300 flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                {pendingCount.shifts + pendingCount.availability} pending
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshData}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </div>
      </CardHeader>
      
      <CardContent>
        {renderMobileNavigation()}
        
        <Tabs defaultValue="shift-swaps" className="mt-2">
          <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
            <TabsTrigger value="shift-swaps" className="text-xs sm:text-sm flex items-center justify-center">
              <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
              Shift Swaps
              {pendingCount.shifts > 0 && (
                <Badge className="ml-1.5 bg-amber-100 text-amber-800 border border-amber-300">
                  {pendingCount.shifts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="availability" className="text-xs sm:text-sm flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Availability
              {pendingCount.availability > 0 && (
                <Badge className="ml-1.5 bg-amber-100 text-amber-800 border border-amber-300">
                  {pendingCount.availability}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="shift-swaps" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {(!isMobile || activeSection === 'form') && (
                <div className="md:col-span-1">
                  <Card className="border shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Plus className="h-4 w-4 mr-1" />
                        Create Shift Swap
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ShiftSwapForm />
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {(!isMobile || activeSection === 'requests') && (
                <div className="md:col-span-2">
                  <Card className="border shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Filter className="h-4 w-4 mr-1" />
                          Shift Swap Requests
                        </CardTitle>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Quick Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer"
                              onClick={() => setActiveSection('form')}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              New Swap Request
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer"
                              onClick={handleRefreshData}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh Data
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ShiftSwapList />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="availability" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {(!isMobile || activeSection === 'form') && (
                <div className="md:col-span-1">
                  {showAvailabilityForm ? (
                    <Card className="border shadow-sm rounded-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Set Availability
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AvailabilityRequestForm onClose={() => setShowAvailabilityForm(false)} />
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="h-10 flex justify-center">
                      <Button 
                        onClick={() => setShowAvailabilityForm(true)}
                        className="bg-primary text-primary-foreground shadow flex items-center rounded-lg"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Set Availability
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {(!isMobile || activeSection === 'requests') && (
                <div className="md:col-span-2">
                  <Card className="border shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Filter className="h-4 w-4 mr-1" />
                          Availability Requests
                        </CardTitle>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Quick Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer"
                              onClick={() => {
                                setActiveSection('form');
                                setShowAvailabilityForm(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              New Availability Request
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center cursor-pointer"
                              onClick={handleRefreshData}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refresh Data
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <AvailabilityRequestList />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScheduleRequestsTab;
