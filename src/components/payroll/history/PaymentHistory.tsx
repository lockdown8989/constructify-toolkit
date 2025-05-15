
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { exportToCSV } from '@/utils/exports';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayrollRecord } from '@/types/supabase/payroll';

export const PaymentHistory = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('last3months');
  
  // Get date ranges based on selection
  const getDateRange = () => {
    const now = new Date();
    
    switch (timeRange) {
      case 'current':
        return format(now, 'yyyy-MM');
      case 'previous':
        return format(new Date(now.getFullYear(), now.getMonth() - 1), 'yyyy-MM');
      case 'last3months':
        return format(new Date(now.getFullYear(), now.getMonth() - 3), 'yyyy-MM');
      case 'last6months':
        return format(new Date(now.getFullYear(), now.getMonth() - 6), 'yyyy-MM');
      case 'lastyear':
        return format(new Date(now.getFullYear() - 1, now.getMonth()), 'yyyy-MM');
      default:
        return format(new Date(now.getFullYear(), now.getMonth() - 3), 'yyyy-MM');
    }
  };
  
  const fromDate = getDateRange();
  
  const { data: paymentHistory, isLoading } = useQuery({
    queryKey: ['payment-history', timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          id,
          employee_id,
          base_pay,
          salary_paid,
          deductions,
          payment_status,
          payment_date,
          delivery_status,
          delivered_at,
          document_url,
          employees (
            name,
            job_title,
            department
          )
        `)
        .gte('payment_date', `${fromDate}-01`)
        .order('payment_date', { ascending: false });
        
      if (error) throw error;
      return data as PayrollRecord[];
    }
  });

  const handleGenerateReport = async () => {
    if (!paymentHistory || paymentHistory.length === 0) {
      toast({
        title: "No payment data",
        description: "There are no payments available for the selected period.",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    try {
      // Format data for CSV export
      const formattedData = paymentHistory.map(record => {
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
          'Payment Status': record.payment_status || 'Unknown',
          'Payment Date': record.payment_date ? format(new Date(record.payment_date), 'dd/MM/yyyy') : 'Pending',
          'Delivery Status': record.delivery_status || 'pending',
          'Delivered At': record.delivered_at ? format(new Date(record.delivered_at), 'dd/MM/yyyy HH:mm') : 'Not delivered'
        };
      });
      
      // Generate CSV filename with date range info
      const filename = `payment_history_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      // Export to CSV
      await exportToCSV(formattedData, filename);
      
      toast({
        title: "Report generated",
        description: `Payment history has been exported to CSV.`,
      });
    } catch (err) {
      console.error("Error generating payment report:", err);
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
          <CardTitle className="text-lg font-medium">Payment History</CardTitle>
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

  if (!paymentHistory || paymentHistory.length === 0) {
    return (
      <Card className="border rounded-xl shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-lg font-medium">Payment History</CardTitle>
          <div className="mt-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                  <SelectItem value="last3months">Last 3 Months</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 px-4">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">Payment History</h3>
          <p className="text-muted-foreground text-center mb-6">No payment data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="border-b bg-gray-50/50 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg font-medium">Payment History</CardTitle>
          <div className="mt-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="current">Current Month</SelectItem>
                  <SelectItem value="previous">Previous Month</SelectItem>
                  <SelectItem value="last3months">Last 3 Months</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGenerateReport}
          disabled={isExporting}
          className="flex items-center gap-1"
        >
          <Download size={16} />
          <span>Generate Report</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isMobile ? (
          <div className="divide-y">
            {paymentHistory.slice(0, 10).map(item => (
              <div 
                key={item.id}
                className="p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{item.employees?.name || 'Unknown'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full 
                    ${item.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 
                      item.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-gray-100 text-gray-700'}`}>
                    {item.payment_status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.payment_date ? format(new Date(item.payment_date), 'dd MMM yyyy') : 'Pending'}
                  </span>
                  <span className="font-medium">£{item.salary_paid?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            ))}
            {paymentHistory.length > 10 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Showing 10 of {paymentHistory.length} entries. Generate a report to see all data.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.slice(0, 15).map(item => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{item.employees?.name || 'Unknown'}</TableCell>
                    <TableCell>{item.employees?.department || 'Unknown'}</TableCell>
                    <TableCell>£{item.salary_paid?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>{item.payment_date ? format(new Date(item.payment_date), 'dd/MM/yyyy') : 'Pending'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full 
                        ${item.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 
                          item.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {item.payment_status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full 
                        ${item.delivery_status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          'bg-yellow-100 text-yellow-700'}`}>
                        {item.delivery_status === 'delivered' ? 'Delivered' : 'Pending'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {paymentHistory.length > 15 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Showing 15 of {paymentHistory.length} entries. Generate a report to see all data.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
