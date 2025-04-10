
import React from 'react';
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

interface DesktopWorkflowViewProps {
  schedules: any[];
  employeeNames: Record<string, string>;
  leaveBalance: {
    annual: number;
    sick: number;
  };
}

const DesktopWorkflowView = ({ schedules, employeeNames, leaveBalance }: DesktopWorkflowViewProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <TimeClockWidget />
        <LeaveBalanceCard leaveBalance={leaveBalance} />
        <AvailabilityManagement />
      </div>
      
      <div className="lg:col-span-2 space-y-6">
        <ShiftAcknowledgment schedules={schedules} employeeNames={employeeNames} />
        
        <Tabs defaultValue="shifts">
          <TabsList>
            <TabsTrigger value="shifts">Shift Swaps</TabsTrigger>
            <TabsTrigger value="leaves">Leave Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shifts" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <ShiftSwapForm />
              </div>
              <div className="md:col-span-2">
                <ShiftSwapList />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="leaves" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leave Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  To submit a leave request or check your leave history, please visit the Leave Management page.
                </p>
                <Button 
                  onClick={() => window.location.href = '/leave-management'}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Go to Leave Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DesktopWorkflowView;
