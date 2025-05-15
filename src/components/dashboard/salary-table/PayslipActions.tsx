
import React from 'react';
import { FileText, Download, Check, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from './types';
import { useToast } from '@/hooks/use-toast';

interface PayslipActionsProps {
  employee: Employee;
  isProcessing?: boolean;
  onDownload?: (employee: Employee) => Promise<void> | void;
  onAttach?: (employee: Employee) => Promise<void> | void;
  onGenerate?: () => void;
}

export const PayslipActions: React.FC<PayslipActionsProps> = ({
  employee,
  isProcessing = false,
  onDownload = async () => {},
  onAttach = async () => {},
  onGenerate,
}) => {
  const { toast } = useToast();
  
  const handleDownload = async () => {
    try {
      await onDownload(employee);
    } catch (error) {
      console.error('Error downloading payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to download payslip',
        variant: 'destructive'
      });
    }
  };
  
  const handleAttach = async () => {
    try {
      await onAttach(employee);
    } catch (error) {
      console.error('Error attaching payslip:', error);
      toast({
        title: 'Error',
        description: 'Failed to attach payslip',
        variant: 'destructive'
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          disabled={isProcessing}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Payslip</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Payslip Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onGenerate && (
          <DropdownMenuItem onClick={onGenerate}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Payslip
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAttach}>
          <Check className="h-4 w-4 mr-2" />
          Attach to Resume
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
