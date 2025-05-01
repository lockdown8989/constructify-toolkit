
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
      return data as PayrollHistoryRecord[];
    }
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No payroll processing history found</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payroll Processing</CardTitle>
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <div className="space-y-4">
            {history.map(item => (
              <div 
                key={item.id}
                className="border rounded-lg p-3 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {formatDate(item.processing_date)}
                  </span>
                  <Badge variant={item.fail_count > 0 ? "outline" : "default"}>
                    {item.fail_count > 0 
                      ? `${item.success_count}/${item.employee_count} Completed` 
                      : 'Completed'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Processed by: {item.profiles?.first_name} {item.profiles?.last_name}</p>
                  <p>Employees: {item.employee_count}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Processed By</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Success</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.processing_date)}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
};
