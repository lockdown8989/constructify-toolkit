import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PayrollRecord } from '@/types/supabase/payroll';
import { format, subMonths } from 'date-fns';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Calendar, FileText } from 'lucide-react';
import { exportToCSV } from '@/utils/exports';
import { useIsMobile } from '@/hooks/use-mobile';

export const PreviousMonthPayslips = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  // Get previous month's date range
  const prevMonthDate = subMonths(new Date(), 1);
  const prevMonth = format(prevMonthDate, 'yyyy-MM');
  
  const { data: payslips, isLoading } = useQuery({
    queryKey: ['previous-month-payslips', prevMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          id,
          employee_id,
          base_pay,
          salary_paid,
          deductions,
          tax_paid,
          ni_contribution,
          other_deductions,
          pension_contribution,
          payment_status,
          payment_date,
          pay_period,
          employees (
            name,
            job_title,
            department,
            site
          )
        `)
        .like('payment_date', `${prevMonth}%`)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      
      // Transform data to match the PayrollRecord type
      return data.map(item => ({
        ...item,
        employees: Array.isArray(item.employees) ? item.employees[0] : item.employees,
        working_hours: 0,
        overtime_hours: 0,
        overtime_pay: 0,
        processing_date: item.payment_date
      })) as PayrollRecord[];
    }
  });

  const handleViewArchive = async () => {
    if (!payslips || payslips.length === 0) {
      toast({
        title: "No archived payslips",
        description: "There are no payslips available for the previous month.",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    try {
      // Format data for CSV export
      const formattedData = payslips.map(record => {
        const employeeData = record.employees as {
          name?: string;
          job_title?: string;
          department?: string;
        } || {};
        
        return {
          'Employee Name': employeeData.name || 'Unknown',
          'Job Title': employeeData.job_title || 'Unknown',
          'Department': employeeData.department || 'Unknown',
          'Base Salary': record.base_pay?.toFixed(2) || '0.00',
          'Net Salary': record.salary_paid?.toFixed(2) || '0.00',
          'Deductions': record.deductions?.toFixed(2) || '0.00',
          'Tax Paid': record.tax_paid?.toFixed(2) || '0.00',
          'NI Contribution': record.ni_contribution?.toFixed(2) || '0.00',
          'Pension Contribution': record.pension_contribution?.toFixed(2) || '0.00',
          'Other Deductions': record.other_deductions?.toFixed(2) || '0.00',
          'Payment Status': record.payment_status || 'Unknown',
          'Pay Period': record.pay_period || format(prevMonthDate, 'MMMM yyyy'),
          'Payment Date': record.payment_date ? format(new Date(record.payment_date), 'dd/MM/yyyy') : 'Pending'
        };
      });
      
      // Generate CSV filename with previous month
      const filename = `archived_payslips_${format(prevMonthDate, 'yyyy-MM')}.csv`;
      
      // Export to CSV
      await exportToCSV(formattedData, filename);
      
      toast({
        title: "Archive exported",
        description: `Previous month's payslips have been exported to CSV.`,
      });
    } catch (err) {
      console.error("Error exporting archived payslips:", err);
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-lg font-medium">Previous Month's Payslips</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payslips || payslips.length === 0) {
    return (
      <Card className="border rounded-xl shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 px-4">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Previous Month's Payslips</h3>
          <p className="text-muted-foreground text-center mb-6">Payslip data for previous month is archived.</p>
          <Button variant="outline" onClick={handleViewArchive} disabled={isExporting}>
            {isExporting ? "Exporting..." : "View Archive"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="border-b bg-gray-50/50 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg font-medium">Previous Month's Payslips</CardTitle>
          <p className="text-sm text-muted-foreground">{format(prevMonthDate, 'MMMM yyyy')}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewArchive} 
          disabled={isExporting}
          className="flex items-center gap-1"
        >
          <Download size={16} />
          <span>Export</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isMobile ? (
          <div className="divide-y">
            {payslips.slice(0, 5).map(item => (
              <div 
                key={item.id}
                className="p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{item.employees?.name || 'Unknown'}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.payment_date ? format(new Date(item.payment_date), 'dd MMM yyyy') : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.employees?.job_title || 'Employee'}</span>
                  <span className="font-medium">£{item.salary_paid?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Base Pay</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map(item => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{item.employees?.name || 'Unknown'}</TableCell>
                    <TableCell>{item.employees?.department || 'Unknown'}</TableCell>
                    <TableCell>£{item.base_pay?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>£{item.salary_paid?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{item.payment_date ? format(new Date(item.payment_date), 'dd/MM/yyyy') : 'Pending'}</TableCell>
                    <TableCell>{item.payment_status || 'Pending'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
