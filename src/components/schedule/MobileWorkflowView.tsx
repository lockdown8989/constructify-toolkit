
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays } from 'lucide-react';
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
    <Tabs defaultValue="shifts">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="shifts">Shifts</TabsTrigger>
        <TabsTrigger value="timeclock">Time Clock</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
        <TabsTrigger value="leave">Leave</TabsTrigger>
      </TabsList>
      
      <TabsContent value="shifts" className="space-y-4 mt-4">
        <ShiftAcknowledgment schedules={schedules} employeeNames={employeeNames} />
        <ShiftSwapList />
        <ShiftSwapForm />
      </TabsContent>
      
      <TabsContent value="timeclock" className="space-y-4 mt-4">
        <TimeClockWidget />
      </TabsContent>
      
      <TabsContent value="availability" className="space-y-4 mt-4">
        <AvailabilityManagement />
      </TabsContent>
      
      <TabsContent value="leave" className="space-y-4 mt-4">
        <LeaveBalanceCard leaveBalance={leaveBalance} />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leave Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              To submit a leave request, please visit the Leave Management page.
            </p>
            <Button 
              onClick={() => window.location.href = '/leave-management'}
              className="w-full"
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
