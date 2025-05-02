
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, CreditCard, AlertCircle, Check } from 'lucide-react';
import { Employee } from '@/components/dashboard/salary-table/types';
import { EmployeeSelector } from './EmployeeSelector';

interface PayrollActionsProps {
  selectedCount: number;
  isProcessing: boolean;
  isExporting: boolean;
  onProcessPayroll: () => void;
  onExportPayroll: () => void;
  employees: Employee[];
  selectedEmployees: Set<string>;
  onSelectEmployee: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const PayrollActions: React.FC<PayrollActionsProps> = ({
  selectedCount,
  isProcessing,
  isExporting,
  onProcessPayroll,
  onExportPayroll,
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onClearAll,
}) => {
  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="border-b bg-gray-50/50 pb-4">
        <CardTitle className="text-lg font-medium">Payroll Actions</CardTitle>
        <CardDescription>Process payslips and export data</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {selectedCount > 0 ? (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Selected Employees:</span>
            <span className="bg-black text-white text-sm font-medium px-2.5 py-1 rounded-full">
              {selectedCount}
            </span>
          </div>
        ) : (
          <div className="bg-amber-50 text-amber-800 p-3 rounded-lg mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm">Select employees to process their payslips.</p>
          </div>
        )}
        
        <EmployeeSelector 
          employees={employees}
          selectedEmployees={selectedEmployees}
          onSelectEmployee={onSelectEmployee}
          onSelectAll={onSelectAll}
          onClearAll={onClearAll}
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-3 border-t bg-gray-50/30 pt-4">
        <Button 
          className="w-full flex items-center gap-2 bg-black hover:bg-black/90 text-white" 
          disabled={selectedCount === 0 || isProcessing}
          onClick={onProcessPayroll}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              <span>Process Payslips</span>
            </>
          )}
        </Button>
        <Button 
          variant="outline"
          className="w-full flex items-center gap-2" 
          disabled={isExporting}
          onClick={onExportPayroll}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              <span>Export Payroll</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
