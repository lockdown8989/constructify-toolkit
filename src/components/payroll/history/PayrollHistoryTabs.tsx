
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SalaryTable from '@/components/dashboard/salary-table';
import { Employee } from '@/components/dashboard/salary-table/types';
import { PayrollProcessingHistory } from './PayrollProcessingHistory';
import { useIsMobile } from '@/hooks/use-mobile';
import { FileText, History, CalendarDays, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PayrollHistoryTabsProps {
  currentMonthEmployees: Employee[];
  onSelectEmployee: (id: string) => void;
  onUpdateStatus: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
}

export const PayrollHistoryTabs: React.FC<PayrollHistoryTabsProps> = ({
  currentMonthEmployees,
  onSelectEmployee,
  onUpdateStatus,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList className="mb-6 grid grid-cols-4 h-auto p-1 bg-muted/20 border">
        <TabsTrigger value="current" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
          <FileText size={16} />
          <span className={isMobile ? "hidden" : ""}>Current Month</span>
        </TabsTrigger>
        <TabsTrigger value="previous" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
          <CalendarDays size={16} />
          <span className={isMobile ? "hidden" : ""}>Previous Month</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
          <History size={16} />
          <span className={isMobile ? "hidden" : ""}>Payment History</span>
        </TabsTrigger>
        <TabsTrigger value="processing" className="flex items-center gap-2 py-3 data-[state=active]:bg-white">
          <ClipboardList size={16} />
          <span className={isMobile ? "hidden" : ""}>Processing Log</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="current">
        <SalaryTable 
          employees={currentMonthEmployees}
          onSelectEmployee={onSelectEmployee}
          onUpdateStatus={onUpdateStatus}
          className="rounded-xl border shadow-sm"
        />
      </TabsContent>
      
      <TabsContent value="previous">
        <Card className="border rounded-xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 px-4">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Previous Month's Payslips</h3>
            <p className="text-muted-foreground text-center mb-6">Payslip data for previous month is archived.</p>
            <Button variant="outline">
              View Archive
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="history">
        <Card className="border rounded-xl shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 px-4">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Payment History</h3>
            <p className="text-muted-foreground text-center mb-6">View detailed payslip history and generate reports.</p>
            <Button variant="outline">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="processing">
        <PayrollProcessingHistory />
      </TabsContent>
    </Tabs>
  );
};
