
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator'; 
import { attachPayslipToResume } from '@/utils/exports/document-manager';
import { SalaryTableProps, Employee } from './types';
import { SearchBar } from './SearchBar';
import { StatusFilter } from './StatusFilter';
import { TableRow } from './TableRow';

const SalaryTable: React.FC<SalaryTableProps> = ({ 
  employees, 
  onSelectEmployee,
  onUpdateStatus,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Absent' | 'Pending'>('All');
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const { employeeId } = useEmployeeDataManagement();
  
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         employee.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
    const isOwnData = !employeeId || employee.id === employeeId;
    
    return matchesSearch && matchesStatus && isOwnData;
  });
  
  const handleStatusChange = (employeeId: string, newStatus: 'Paid' | 'Absent' | 'Pending') => {
    if (onUpdateStatus) {
      onUpdateStatus(employeeId, newStatus);
    }
  };
  
  const handleDownloadPayslip = async (employee: Employee) => {
    setIsProcessing(prev => ({ ...prev, [employee.id]: true }));
    
    try {
      // Generate current month's pay period for the payslip
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const payPeriod = `${firstDayOfMonth.toLocaleDateString()} - ${lastDayOfMonth.toLocaleDateString()}`;
      
      await generatePayslipPDF(employee.id, {
        name: employee.name,
        title: employee.title,
        salary: typeof employee.salary === 'number' ? employee.salary.toString() : employee.salary,
        department: employee.department,
        paymentDate: employee.paymentDate || new Date().toISOString().split('T')[0],
        payPeriod: payPeriod,
        overtimeHours: 0,
        contractualHours: 160
      });
      
      toast({
        title: "Payslip generated",
        description: "Payslip has been downloaded to your device",
      });
    } catch (error) {
      console.error('Error generating payslip:', error);
      toast({
        title: "Error generating payslip",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [employee.id]: false }));
    }
  };
  
  const handleAttachToResume = async (employee: Employee) => {
    setIsProcessing(prev => ({ ...prev, [employee.id]: true }));
    
    try {
      const result = await attachPayslipToResume(employee.id, {
        name: employee.name,
        title: employee.title,
        salary: typeof employee.salary === 'number' ? employee.salary.toString() : employee.salary,
        department: employee.department,
        paymentDate: employee.paymentDate
      });
      
      if (result.success) {
        toast({
          title: "Payslip attached",
          description: result.message,
        });
      } else {
        toast({
          title: "Error attaching payslip",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error attaching payslip to resume:', error);
      toast({
        title: "Error attaching payslip",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [employee.id]: false }));
    }
  };
  
  const statusCount = {
    All: employees.length,
    Paid: employees.filter(e => e.status === 'Paid').length,
    Pending: employees.filter(e => e.status === 'Pending').length,
    Absent: employees.filter(e => e.status === 'Absent').length
  };

  return (
    <div className={cn("bg-white rounded-3xl p-6 card-shadow", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium">Salary</h3>
        
        <div className="flex gap-2">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <StatusFilter 
            currentStatus={statusFilter}
            onStatusChange={setStatusFilter}
            statusCount={statusCount}
          />
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-4 font-medium w-6"></th>
              <th className="pb-4 font-medium">Name</th>
              <th className="pb-4 font-medium">Job Title</th>
              <th className="pb-4 font-medium">Net Salary</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Payment Date</th>
              <th className="pb-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEmployees.map(employee => (
              <TableRow
                key={employee.id}
                employee={employee}
                isProcessing={isProcessing[employee.id] || false}
                onSelectEmployee={onSelectEmployee || (() => {})}
                onStatusChange={handleStatusChange}
                onDownloadPayslip={handleDownloadPayslip}
                onAttachToResume={handleAttachToResume}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryTable;
