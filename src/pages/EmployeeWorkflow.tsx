
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShiftAcknowledgment from '@/components/schedule/ShiftAcknowledgment';
import TimeClockWidget from '@/components/schedule/TimeClockWidget';
import ShiftSwapForm from '@/components/schedule/ShiftSwapForm';
import ShiftSwapList from '@/components/schedule/ShiftSwapList';
import AvailabilityManagement from '@/components/schedule/AvailabilityManagement';
import { useSchedules } from '@/hooks/use-schedules';
import { useEmployees } from '@/hooks/use-employees';
import { useLeaveCalendar, useAddLeaveRequest } from '@/hooks/use-leave-calendar';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar, Clock, CalendarDays, ArrowLeftRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, addDays, differenceInBusinessDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const EmployeeWorkflow = () => {
  const { user } = useAuth();
  const { data: schedules = [] } = useSchedules();
  const { data: employees = [] } = useEmployees();
  const { data: leaveEvents = [] } = useLeaveCalendar();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Create a mapping of employee IDs to names
  const employeeNames = employees.reduce<Record<string, string>>((acc, employee) => {
    acc[employee.id] = employee.name;
    return acc;
  }, {});
  
  // Get the current employee
  const currentEmployee = user 
    ? employees.find(emp => emp.user_id === user.id) 
    : null;
  
  // Calculate leave balance
  const calculateLeaveBalance = () => {
    if (!currentEmployee) return { annual: 0, sick: 0 };
    
    const annualLeaveUsed = leaveEvents
      .filter(event => 
        event.employee_id === currentEmployee.id && 
        event.type === 'Holiday' && 
        event.status === 'Approved'
      )
      .reduce((total, event) => {
        return total + differenceInBusinessDays(
          new Date(event.end_date), 
          new Date(event.start_date)
        ) + 1;
      }, 0);
    
    const sickLeaveUsed = leaveEvents
      .filter(event => 
        event.employee_id === currentEmployee.id && 
        event.type === 'Sickness' && 
        event.status === 'Approved'
      )
      .reduce((total, event) => {
        return total + differenceInBusinessDays(
          new Date(event.end_date), 
          new Date(event.start_date)
        ) + 1;
      }, 0);
    
    return {
      annual: (currentEmployee.annual_leave_days || 20) - annualLeaveUsed,
      sick: (currentEmployee.sick_leave_days || 10) - sickLeaveUsed
    };
  };
  
  const leaveBalance = calculateLeaveBalance();
  
  if (!user) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Employee Workflow</h1>
        <p>Please sign in to access your employee workflow.</p>
      </div>
    );
  }
  
  // Split page into tabs for mobile view
  const renderMobileView = () => {
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
  
  // Desktop view with all sections visible
  const renderDesktopView = () => {
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
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Employee Workflow</h1>
      
      {isMobile ? renderMobileView() : renderDesktopView()}
    </div>
  );
};

// Helper component for leave balance card
const LeaveBalanceCard = ({ leaveBalance }: { leaveBalance: { annual: number; sick: number } }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Leave Balance
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Annual Leave</span>
            <span className="font-medium">{leaveBalance.annual} days</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Sick Leave</span>
            <span className="font-medium">{leaveBalance.sick} days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeWorkflow;
