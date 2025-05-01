
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface PayrollHistoryRecord {
  id: string;
  employee_count: number;
  success_count: number;
  fail_count: number;
  processed_by: string;
  processing_date: string;
  employee_ids?: string[]; // Make this property optional
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const PayrollProcessingHistory = () => {
  const isMobile = useIsMobile();
  
  const { data: history, isLoading } = useQuery({
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
          profiles:processed_by(first_name, last_name)
        `)
        .order('processing_date', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      // Cast the response to match our expected type
      return (data as unknown) as PayrollHistoryRecord[];
    }
  });
  
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
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-lg font-medium">Processing History</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground py-8">No payroll processing history found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="border-b bg-gray-50/50">
        <CardTitle className="text-lg font-medium">Recent Payroll Processing</CardTitle>
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
                    {formatDate(item.processing_date)}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Processed By</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead>Success</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map(item => (
                  <TableRow key={item.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{formatDate(item.processing_date)}</TableCell>
                    <TableCell>{item.profiles?.first_name} {item.profiles?.last_name}</TableCell>
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
