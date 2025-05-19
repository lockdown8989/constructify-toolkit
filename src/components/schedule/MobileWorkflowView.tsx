
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, CalendarClock, ArrowLeftRight, Users } from 'lucide-react';
import ShiftAcknowledgment from './ShiftAcknowledgment';
import TimeClockWidget from './TimeClockWidget';
import ShiftSwapTab from './ShiftSwapTab';
import AvailabilityManagement from './AvailabilityManagement';
import LeaveBalanceCard from './LeaveBalanceCard';
import { ScheduleTabs } from './components/ScheduleTabs';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MobileWorkflowViewProps {
  schedules: any[];
  employeeNames: Record<string, string>;
  leaveBalance: {
    annual: number;
    sick: number;
  };
}

const MobileWorkflowView = ({ schedules, employeeNames, leaveBalance }: MobileWorkflowViewProps) => {
  const [activeTab, setActiveTab] = useState('shifts');
  const [scheduleTab, setScheduleTab] = useState('shift-swaps');
  const { newSchedules, setIsInfoDialogOpen, setSelectedScheduleId } = useEmployeeSchedule();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleInfoClick = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setIsInfoDialogOpen(true);
  };
  
  const handleEmailClick = (schedule: any) => {
    // Email functionality would be implemented here
    toast({
      title: "Email sent",
      description: "A confirmation email has been sent to your inbox.",
    });
  };
  
  const handleCancelClick = (scheduleId: string) => {
    toast({
      title: "Shift cancellation requested",
      description: "Your request to cancel this shift has been submitted.",
    });
  };
  
  const handleLeaveRequestClick = () => {
    // Redirect to Leave Management page with employee view selected and form=true parameter
    navigate('/leave-management', { 
      state: { 
        initialView: 'employee',
        showLeaveRequestForm: true 
      } 
    });
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-2 rounded-xl">
        <TabsTrigger value="shifts" className="text-xs py-2.5">
          <span className="flex flex-col items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            <span>Shifts</span>
          </span>
        </TabsTrigger>
        <TabsTrigger value="swap" className="text-xs py-2.5">
          <span className="flex flex-col items-center gap-1">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Shift Swaps</span>
          </span>
        </TabsTrigger>
        <TabsTrigger value="availability" className="text-xs py-2.5">
          <span className="flex flex-col items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Availability</span>
          </span>
        </TabsTrigger>
        <TabsTrigger value="leave" className="text-xs py-2.5">
          <span className="flex flex-col items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Leave</span>
          </span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="shifts" className="space-y-4 mt-4 no-scrollbar mobile-full-width">
        <Card className="border rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              Employee Schedule 👥
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 pt-0">
            <ScheduleTabs
              activeTab={scheduleTab}
              setActiveTab={setScheduleTab}
              schedules={schedules}
              newSchedules={newSchedules}
              onInfoClick={handleInfoClick}
              onEmailClick={handleEmailClick}
              onCancelClick={handleCancelClick}
              onResponseComplete={() => {}}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="swap" className="space-y-4 mt-4 no-scrollbar mobile-full-width">
        <ShiftSwapTab />
      </TabsContent>
      
      <TabsContent value="availability" className="space-y-4 mt-4 no-scrollbar mobile-full-width">
        <AvailabilityManagement />
      </TabsContent>
      
      <TabsContent value="leave" className="space-y-4 mt-4 no-scrollbar mobile-full-width">
        <LeaveBalanceCard leaveBalance={leaveBalance} />
        <Card className="border rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-base">Leave Management</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="mb-4 text-sm text-muted-foreground">
              To submit a leave request, please visit the Leave Management page.
            </p>
            <Button 
              onClick={handleLeaveRequestClick}
              className="w-full active-touch-state"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MobileWorkflowView;
