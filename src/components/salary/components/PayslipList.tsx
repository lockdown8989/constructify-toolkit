
import React from 'react';
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
  
  const { data: payslips, isLoading, error } = useQuery({
    queryKey: ['employee-payslips', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employeeId)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
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
      </Card>
    );
  }
  
  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Recent Payslips</h3>
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
                <p className="text-sm text-gray-500">
                  Payment Date: {format(paymentDate, 'dd.MM.yyyy')}
                </p>
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
