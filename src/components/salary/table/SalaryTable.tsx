
import React, { useState, useMemo, useCallback } from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { SearchBar } from './SearchBar';
import { StatusFilter } from './StatusFilter';
import { TableRow } from './TableRow';
import { SalaryTableProps } from './types';

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

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           employee.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  const handleDownloadPayslip = useCallback(async (employee: typeof employees[0]) => {
    setIsProcessing(prev => ({ ...prev, [employee.id]: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated download
      toast({
        title: "Payslip downloaded",
        description: `Payslip for ${employee.name} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [employee.id]: false }));
    }
  }, [toast]);

  const handleAttachToResume = useCallback(async (employee: typeof employees[0]) => {
    setIsProcessing(prev => ({ ...prev, [employee.id]: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated attachment
      toast({
        title: "Payslip attached",
        description: `Payslip has been attached to ${employee.name}'s resume.`,
      });
    } catch (error) {
      toast({
        title: "Attachment failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(prev => ({ ...prev, [employee.id]: false }));
    }
  }, [toast]);

  const statusCount = useMemo(() => ({
    All: employees.length,
    Paid: employees.filter(e => e.status === 'Paid').length,
    Pending: employees.filter(e => e.status === 'Pending').length,
    Absent: employees.filter(e => e.status === 'Absent').length
  }), [employees]);

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
                onStatusChange={onUpdateStatus || (() => {})}
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

export default React.memo(SalaryTable);
