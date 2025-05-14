
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, CalendarClock } from 'lucide-react';
import ShiftAcknowledgment from './ShiftAcknowledgment';
import TimeClockWidget from './TimeClockWidget';
import ShiftSwapForm from './ShiftSwapForm';
import ShiftSwapList from './ShiftSwapList';
import AvailabilityManagement from './AvailabilityManagement';
import LeaveBalanceCard from './LeaveBalanceCard';

interface MobileWorkflowViewProps {
  schedules: any[];
  employeeNames: Record<string, string>;
  leaveBalance: {
    annual: number;
    sick: number;
  };
}

const MobileWorkflowView = ({ schedules, employeeNames, leaveBalance }: MobileWorkflowViewProps) => {
  return (
    <Tabs defaultValue="shifts" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-2 rounded-xl">
        <TabsTrigger value="shifts" className="text-xs py-2.5">
          <span className="flex flex-col items-center gap-1">
            <CalendarClock className="h-4 w-4" />
            <span>Shifts</span>
          </span>
        </TabsTrigger>
        <TabsTrigger value="timeclock" className="text-xs py-2.5">
          <span className="flex flex-col items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Time Clock</span>
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
              <CalendarClock className="h-4 w-4 mr-2 text-primary" />
              Current Shifts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
            <ShiftAcknowledgment schedules={schedules} employeeNames={employeeNames} />
          </CardContent>
        </Card>
        <ShiftSwapList />
        <ShiftSwapForm />
      </TabsContent>
      
      <TabsContent value="timeclock" className="space-y-4 mt-4 no-scrollbar mobile-full-width">
        <TimeClockWidget />
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
              onClick={() => window.location.href = '/leave'}
              className="w-full active-touch-state"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Go to Leave Management
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default MobileWorkflowView;
