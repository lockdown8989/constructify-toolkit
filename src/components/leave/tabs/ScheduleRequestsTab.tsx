
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus, Filter, ArrowLeftRight } from 'lucide-react';
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
import ScheduleHeader from '@/components/schedule/components/ScheduleHeader';
import MobileNavigation from '@/components/schedule/components/MobileNavigation';
import { useScheduleRealtime } from '@/hooks/leave/use-schedule-realtime';

const ScheduleRequestsTab: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user, isManager } = useAuth();
  const [activeSection, setActiveSection] = useState<'requests' | 'form'>('requests');
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [pendingCount, setPendingCount] = useState({ shifts: 0, availability: 0 });

  // Use the real-time hook
  useScheduleRealtime();

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
  
  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['shift_swaps'] });
    queryClient.invalidateQueries({ queryKey: ['availability_requests'] });
    setLastRefreshed(new Date());
    toast({
      title: "Data refreshed",
      description: "Schedule request data has been refreshed."
    });
  };

  return (
    <>
      <ScheduleHeader 
        pendingCount={pendingCount}
        lastRefreshed={lastRefreshed}
        isManager={isManager}
        onRefresh={handleRefreshData}
      />
      
      <CardContent className="p-0">
        <MobileNavigation 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isMobile={isMobile}
        />
        
        <div className="px-4 sm:px-6">
          <Tabs defaultValue="shift-swaps" className="mt-2">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="shift-swaps" className="text-xs sm:text-sm flex items-center justify-center px-3 py-2.5">
                <ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" />
                Shift Swaps
                {pendingCount.shifts > 0 && (
                  <Badge className="ml-1.5 bg-amber-100 text-amber-800 border border-amber-300">
                    {pendingCount.shifts}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="availability" className="text-xs sm:text-sm flex items-center justify-center px-3 py-2.5">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Availability
                {pendingCount.availability > 0 && (
                  <Badge className="ml-1.5 bg-amber-100 text-amber-800 border border-amber-300">
                    {pendingCount.availability}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="shift-swaps" className="space-y-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {(!isMobile || activeSection === 'form') && (
                  <div className="md:col-span-1 order-2 md:order-1">
                    <Card className="bg-white border shadow-sm rounded-xl h-full">
                      <CardHeader className="pb-3 border-b">
                        <h3 className="text-sm font-semibold flex items-center">
                          <Plus className="h-4 w-4 mr-2 text-primary" />
                          Create Shift Swap
                        </h3>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ShiftSwapForm />
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {(!isMobile || activeSection === 'requests') && (
                  <div className="md:col-span-2 order-1 md:order-2">
                    <Card className="bg-white border shadow-sm rounded-xl">
                      <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold flex items-center">
                            <Filter className="h-4 w-4 mr-2 text-primary" />
                            Shift Swap Requests
                          </h3>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
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
                                <Filter className="h-4 w-4 mr-2" />
                                Refresh Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <ShiftSwapList />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="availability" className="space-y-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {(!isMobile || activeSection === 'form') && (
                  <div className="md:col-span-1 order-2 md:order-1">
                    {showAvailabilityForm ? (
                      <Card className="bg-white border shadow-sm rounded-xl">
                        <CardHeader className="pb-3 border-b">
                          <h3 className="text-sm font-semibold flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            Set Availability
                          </h3>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <AvailabilityRequestForm onClose={() => setShowAvailabilityForm(false)} />
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="flex justify-center py-6 bg-white border shadow-sm rounded-xl">
                        <Button 
                          onClick={() => setShowAvailabilityForm(true)}
                          className="bg-primary text-primary-foreground shadow flex items-center rounded-lg"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Set Availability
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {(!isMobile || activeSection === 'requests') && (
                  <div className="md:col-span-2 order-1 md:order-2">
                    <Card className="bg-white border shadow-sm rounded-xl">
                      <CardHeader className="pb-3 border-b">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold flex items-center">
                            <Filter className="h-4 w-4 mr-2 text-primary" />
                            Availability Requests
                          </h3>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
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
                                <Filter className="h-4 w-4 mr-2" />
                                Refresh Data
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <AvailabilityRequestList />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </>
  );
};

export default ScheduleRequestsTab;
