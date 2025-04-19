
import React from 'react';
import { differenceInBusinessDays } from 'date-fns';
import { useSchedules } from '@/hooks/use-schedules';
import { useEmployees } from '@/hooks/use-employees';
import { useLeaveCalendar } from '@/hooks/use-leave-calendar';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileWorkflowView from '@/components/schedule/MobileWorkflowView';
import DesktopWorkflowView from '@/components/schedule/DesktopWorkflowView';

const EmployeeWorkflow = () => {
  const { user } = useAuth();
  const { data: schedules = [] } = useSchedules();
  const { data: employees = [] } = useEmployees();
  const { data: leaveEvents = [] } = useLeaveCalendar();
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
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Employee Workflow</h1>
      
      {isMobile ? (
        <MobileWorkflowView 
          schedules={schedules} 
          employeeNames={employeeNames}
          leaveBalance={leaveBalance}
        />
      ) : (
        <DesktopWorkflowView 
          schedules={schedules} 
          employeeNames={employeeNames}
          leaveBalance={leaveBalance}
        />
      )}
    </div>
  );
};

export default EmployeeWorkflow;
