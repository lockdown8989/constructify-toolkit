
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import CurrentDateTime from '@/components/dashboard/CurrentDateTime';
import DashboardStatsSection from '@/components/dashboard/DashboardStatsSection';
import SalaryTable from '@/components/salary/table/SalaryTable';
import AttendanceReport from '@/components/dashboard/attendance-report';
import ManagerTab from '@/components/leave/tabs/ManagerTab';
import { Employee } from '@/components/salary/table/types';

interface PayrollDashboardProps {
  firstName: string;
  employeeCount: number;
  hiredCount: number;
}

const PayrollDashboard: React.FC<PayrollDashboardProps> = ({
  firstName,
  employeeCount,
  hiredCount,
}) => {
  const { user } = useAuth();
  const { data: employees = [] } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Transform employees data for the SalaryTable
  const salaryEmployees: Employee[] = employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    avatar: emp.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
    title: emp.job_title,
    salary: `$${emp.salary.toLocaleString()}`,
    status: emp.status === 'Active' ? 'Paid' as const : emp.status === 'Leave' ? 'Absent' as const : 'Pending' as const,
    paymentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    selected: emp.id === selectedEmployee,
    department: emp.department
  }));

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployee(id === selectedEmployee ? null : id);
  };

  const handleUpdateStatus = (employeeId: string, newStatus: 'Paid' | 'Absent' | 'Pending') => {
    // This would typically update the employee status in the database
    console.log(`Updating employee ${employeeId} status to ${newStatus}`);
    // For now, just log the action - in a real app this would make an API call
  };

  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-4xl font-bold">Hello {firstName}</h1>
        <CurrentDateTime className="md:w-auto w-full mt-4 md:mt-0" />
      </div>
      
      {/* Stats */}
      <DashboardStatsSection 
        employeeCount={employeeCount} 
        hiredCount={hiredCount} 
        isManager={false} 
      />
      
      {/* Payroll-specific content with salary information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Leave Management */}
        <div className="lg:col-span-3">
          <ManagerTab />
        </div>
        
        {/* Middle Column - Salary Table for Payroll Users */}
        <div className="lg:col-span-5">
          <SalaryTable 
            employees={salaryEmployees} 
            onSelectEmployee={handleSelectEmployee}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
        
        {/* Right Column - Attendance Report */}
        <div className="lg:col-span-4">
          <AttendanceReport 
            employeeId={selectedEmployee ?? undefined}
            className="mb-6" 
          />
        </div>
      </div>
    </div>
  );
};

export default PayrollDashboard;
