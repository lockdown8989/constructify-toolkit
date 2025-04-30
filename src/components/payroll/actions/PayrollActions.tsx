
import React from 'react';
import { Download, Loader2, FileCheck, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <Card className="bg-gradient-to-br from-black to-gray-800 text-white">
      <CardHeader className="pb-2">
        <CardDescription className="text-gray-300">Quick Actions</CardDescription>
        <CardTitle className="text-xl">Process Payslips</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          className="w-full bg-white text-black hover:bg-gray-100 font-medium flex items-center gap-2"
          onClick={onProcessPayroll}
          disabled={isProcessing || selectedCount === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4" />
              Process Selected ({selectedCount})
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          className="w-full border-white text-white hover:bg-white/10 flex items-center gap-2"
          onClick={onExportPayroll}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export Payslips CSV
            </>
          )}
        </Button>
      </CardContent>
      <CardFooter className="pt-0">
        <p className="text-xs text-gray-400">
          {selectedCount === 0 
            ? "Please select employees to process payslips" 
            : `${selectedCount} employee${selectedCount !== 1 ? 's' : ''} selected for processing`}
        </p>
      </CardFooter>
    </Card>
  );
};
