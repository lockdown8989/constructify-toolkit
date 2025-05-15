
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV } from '@/utils/exports';
import { PayrollHistoryRecord } from '@/types/supabase/payroll';

export const PayrollProcessingHistory = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  
  const { data: history, isLoading, refetch } = useQuery({
    queryKey: ['payroll-processing-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll_history')
        .select(`
          id, 
          employee_count, 
          success_count, 
          fail_count, 
          processed_by, 
          processing_date,
          employee_ids,
          profiles:processed_by(first_name, last_name)
        `)
        .order('processing_date', { ascending: false })
        .limit(50);
        
      if (error) {
        console.error('Error fetching payroll history:', error);
        throw error;
      }
      
      // Cast the response to match our expected type
      return (data as unknown) as PayrollHistoryRecord[];
    }
  });

  const handleExportHistory = async () => {
    if (!history || history.length === 0) {
      toast({
        title: "No processing history",
        description: "There is no processing history to export.",
        variant: "destructive"
      });
      return;
    }
    
    setIsExporting(true);
    try {
      // Format data for CSV export
      const formattedData = history.map(item => {
        return {
          'Date': format(new Date(item.processing_date), 'yyyy-MM-dd HH:mm:ss'),
          'Processed By': item.profiles ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}` : 'Unknown',
          'Total Employees': item.employee_count,
          'Success Count': item.success_count,
          'Failed Count': item.fail_count,
          'Success Rate': `${((item.success_count / item.employee_count) * 100).toFixed(0)}%`,
          'Status': item.fail_count > 0 ? 'Partial' : 'Complete'
        };
      });
      
      // Generate CSV filename with date
      const filename = `payroll_processing_history_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      // Export to CSV
      await exportToCSV(formattedData, filename);
      
      toast({
        title: "Export successful",
        description: "Processing history has been exported to CSV.",
      });
    } catch (err) {
      console.error("Error exporting processing history:", err);
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
          <CardTitle className="text-lg font-medium">Processing History</CardTitle>
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
  
  if (!history || history.length === 0) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="border-b bg-gray-50/50 flex flex-row justify-between items-center">
          <CardTitle className="text-lg font-medium">Processing History</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground py-8">No payroll processing history found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="border-b bg-gray-50/50 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-medium">Payroll Processing History</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportHistory}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isMobile ? (
          <div className="divide-y">
            {history.map(item => (
              <div 
                key={item.id}
                className="p-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">
                    {format(new Date(item.processing_date), 'MMM d, yyyy HH:mm')}
                  </span>
                  <Badge variant={item.fail_count > 0 ? "outline" : "default"} className="ml-2">
                    {item.fail_count > 0 
                      ? `${item.success_count}/${item.employee_count}` 
                      : 'Complete'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">
                      {item.profiles?.first_name} {item.profiles?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {item.employee_count} employees
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/70 hover:bg-gray-50/70">
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead>Total Employees</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(item => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">
                      {format(new Date(item.processing_date), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>{item.profiles?.first_name || ''} {item.profiles?.last_name || ''}</TableCell>
                    <TableCell>{item.employee_count}</TableCell>
                    <TableCell>{item.success_count}/{item.employee_count}</TableCell>
                    <TableCell>
                      <Badge variant={item.fail_count > 0 ? "outline" : "default"}>
                        {item.fail_count > 0 ? 'Partial' : 'Complete'}
                      </Badge>
                    </TableCell>
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
