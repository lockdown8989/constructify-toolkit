
import { useState } from 'react';
import { Employee } from '@/components/salary/table/types';
import { useToast } from '@/components/ui/use-toast';

export const usePayroll = (initialEmployees: Employee[] = []) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleSelectEmployee = (employeeId: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(employeeId)) {
      newSelection.delete(employeeId);
    } else {
      newSelection.add(employeeId);
    }
    setSelectedEmployees(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = initialEmployees.map(emp => emp.id);
    setSelectedEmployees(new Set(allIds));
  };

  const handleClearAll = () => {
    setSelectedEmployees(new Set());
  };

  const handleProcessPayroll = async () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to process payroll for",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate processing payroll
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Payroll Processed",
        description: `Successfully processed payroll for ${selectedEmployees.size} employee(s)`,
      });
      
      // Reset selection after successful processing
      setSelectedEmployees(new Set());
    } catch (error) {
      toast({
        title: "Error Processing Payroll",
        description: "There was an error processing the payroll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPayroll = async () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to export payroll data for",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Simulate exporting payroll data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Payroll Data Exported",
        description: `Successfully exported payroll data for ${selectedEmployees.size} employee(s)`,
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "There was an error exporting the payroll data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    selectedEmployees,
    isProcessing,
    isExporting,
    handleSelectEmployee,
    handleSelectAll,
    handleClearAll,
    handleProcessPayroll,
    handleExportPayroll,
  };
};
