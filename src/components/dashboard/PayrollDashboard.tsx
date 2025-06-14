
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useEmployees } from '@/hooks/use-employees';
import DashboardHeader from './DashboardHeader';
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
  const { user, isPayroll } = useAuth();
  const { data: employees = [], isLoading, error } = useEmployees();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  console.log("PayrollDashboard - employees loaded:", employees.length, "isPayroll:", isPayroll);

  // Transform employees data for the SalaryTable
  const salaryEmployees: Employee[] = employees.map(emp => ({
    id: emp.id,
    name: emp.name,
    avatar: emp.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
    title: emp.job_title,
    salary: `£${emp.salary.toLocaleString()}`,
    status: emp.status === 'Active' ? 'Paid' as const : emp.status === 'Leave' ? 'Absent' as const : 'Pending' as const,
    paymentDate: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }),
    selected: emp.id === selectedEmployee,
    department: emp.department
  }));

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployee(id === selectedEmployee ? null : id);
  };

  const handleUpdateStatus = (employeeId: string, newStatus: 'Paid' | 'Absent' | 'Pending') => {
    console.log(`Updating employee ${employeeId} status to ${newStatus}`);
    // TODO: Implement actual status update
  };

  if (isLoading) {
    return (
      <div className="max-w-[1800px] mx-auto">
        <DashboardHeader firstName={firstName} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-600">Loading payroll data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1800px] mx-auto">
        <DashboardHeader firstName={firstName} />
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">Error loading employee data. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto">
      <DashboardHeader firstName={firstName} />
      
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
