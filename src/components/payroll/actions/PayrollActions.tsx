
import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PayrollActionsProps {
  selectedCount: number;
  isProcessing: boolean;
  isExporting: boolean;
  onProcessPayroll: () => void;
  onExportPayroll: () => void;
}

export const PayrollActions: React.FC<PayrollActionsProps> = ({
  selectedCount,
  isProcessing,
  isExporting,
  onProcessPayroll,
  onExportPayroll,
}) => {
  return (
    <Card className="bg-black text-white">
      <CardHeader className="pb-2">
        <CardDescription className="text-gray-300">Quick Actions</CardDescription>
        <CardTitle className="text-xl">Process Payslips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          className="w-full bg-white text-black hover:bg-gray-100"
          onClick={onProcessPayroll}
          disabled={isProcessing || selectedCount === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Process Selected (${selectedCount})`
          )}
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-white text-white hover:bg-white/10"
          onClick={onExportPayroll}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export Payslips CSV
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
