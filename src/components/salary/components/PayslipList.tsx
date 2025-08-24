
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { generatePayslipPDF } from '@/utils/exports';

interface PayslipListProps {
  employeeId: string;
}

export const PayslipList: React.FC<PayslipListProps> = ({ employeeId }) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  
  const { data: payslips, isLoading, error, refetch } = useQuery({
    queryKey: ['employee-payslips', employeeId],
    queryFn: async () => {
      console.log("Fetching payslips for employee:", employeeId);
      
      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employeeId)
        .order('payment_date', { ascending: false });
        
      if (error) {
        console.error('Error fetching payslips:', error);
        throw error;
      }
      
      console.log("Fetched payslips:", data);
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds to get latest data
    staleTime: 0 // Always consider data stale to ensure fresh fetches
  });
  
  const handleDownloadPayslip = async (payslipId: string, paymentDate: string) => {
    setIsDownloading(prev => ({ ...prev, [payslipId]: true }));
    
    try {
      // Get employee details
      const { data: employee } = await supabase
        .from('employees')
        .select('name, job_title, department, salary')
        .eq('id', employeeId)
        .single();
        
      if (!employee) {
        throw new Error('Employee information not found');
      }
      
      // Get payslip details
      const { data: payslip } = await supabase
        .from('payroll')
        .select('*')
        .eq('id', payslipId)
        .single();
        
      if (!payslip) {
        throw new Error('Payslip information not found');
      }
      
      // Generate PDF
      await generatePayslipPDF(employeeId, {
        name: employee.name,
        title: employee.job_title,
        department: employee.department,
        salary: payslip.base_pay?.toString() || employee.salary?.toString() || '0',
        paymentDate: payslip.payment_date || paymentDate,
        overtimeHours: payslip.overtime_hours || 0,
        contractualHours: payslip.working_hours || 0
      });
      
      toast({
        title: 'Payslip downloaded',
        description: 'Your payslip has been downloaded successfully'
      });
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Failed to download payslip',
        variant: 'destructive'
      });
    } finally {
      setIsDownloading(prev => ({ ...prev, [payslipId]: false }));
    }
  };
  
  // Force refetch when component mounts or employeeId changes
  React.useEffect(() => {
    refetch();
  }, [employeeId, refetch]);
  
  if (isLoading) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Recent Payslips</h3>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-2">Recent Payslips</h3>
        <p className="text-sm text-red-500">
          Failed to load payslips. Please try again later.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="mt-2"
        >
          Retry
        </Button>
      </Card>
    );
  }
  
  if (!payslips || payslips.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-2">Recent Payslips</h3>
        <p className="text-sm text-gray-500">
          No payslips available yet.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          className="mt-2"
        >
          Check for updates
        </Button>
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Recent Payslips</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </div>
      <div className="space-y-2">
        {payslips.map((payslip) => {
          // Format the payment date
          const paymentDate = payslip.payment_date ? 
            parseISO(payslip.payment_date) : new Date();
          
          // Format the month and year for display
          const monthYear = format(paymentDate, 'MMMM yyyy');
          
          return (
            <div key={payslip.id} 
              className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50"
            >
              <div>
                <h4 className="font-medium">{monthYear}</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>Payment Date: {format(paymentDate, 'dd.MM.yyyy')}</p>
                  <p>Net Pay: £{payslip.salary_paid?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs">Status: {payslip.payment_status || 'Processed'}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleDownloadPayslip(payslip.id, payslip.payment_date)}
                disabled={isDownloading[payslip.id]}
              >
                {isDownloading[payslip.id] ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span> 
                    Downloading...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Download className="h-4 w-4 mr-2" /> 
                    Download
                  </span>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PayslipList;
