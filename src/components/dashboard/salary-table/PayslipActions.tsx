
import React from 'react';
import { FileText, Download, Check, ChevronDown, Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from './types';
import { useToast } from '@/hooks/use-toast';
import { notifyEmployeeAboutPayslip } from '@/services/notifications/payroll-notifications';
import { supabase } from '@/integrations/supabase/client';

interface PayslipActionsProps {
  employee: Employee;
  isProcessing?: boolean;
  onDownload?: (employee: Employee) => Promise<void> | void;
  onAttach?: (employee: Employee) => Promise<void> | void;
  onGenerate?: () => void;
}

export const PayslipActions: React.FC<PayslipActionsProps> = ({
  employee,
  isProcessing = false,
  onDownload = async () => {},
  onAttach = async () => {},
  onGenerate,
}) => {
  const { toast } = useToast();
  
  const handleDownload = async () => {
    try {
      await onDownload(employee);
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to download payslip',
        variant: 'destructive'
      });
    }
  };
  
  const handleAttach = async () => {
    try {
      await onAttach(employee);
    } catch (error) {
      console.error('Error attaching payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach payslip',
        variant: 'destructive'
      });
    }
  };

  const handleNotify = async () => {
    try {
      // Get employee's user_id
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('user_id')
        .eq('id', employee.id)
        .single();
      
      if (employeeError || !employeeData?.user_id) {
        throw new Error('Could not find employee user account');
      }
      
      // Get latest payroll record for this employee
      const { data: payrollData, error: payrollError } = await supabase
        .from('payroll_history')
        .select('*')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (payrollError || !payrollData) {
        throw new Error('No payroll record found for this employee');
      }

      // Send notification
      await notifyEmployeeAboutPayslip(
        employee.id,
        employeeData.user_id,
        typeof employee.salary === 'number' ? employee.salary : 
          typeof employee.salary === 'string' ? parseFloat(employee.salary.replace(/[^0-9.]/g, '')) : 0,
        'GBP',
        payrollData.payment_date || new Date().toISOString()
      );
      
      toast({
        title: 'Success',
        description: `Payslip notification sent to ${employee.name}`,
      });
    } catch (error) {
      console.error('Error notifying about payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to send payslip notification',
        variant: 'destructive'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          disabled={isProcessing}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Payslip</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Payslip Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onGenerate && (
          <DropdownMenuItem onClick={onGenerate}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Payslip
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAttach}>
          <Check className="h-4 w-4 mr-2" />
          Attach to Resume
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNotify}>
          <Bell className="h-4 w-4 mr-2" />
          Notify Employee
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
