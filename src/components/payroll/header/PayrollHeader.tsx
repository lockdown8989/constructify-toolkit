
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Download, Settings, Loader2, RefreshCw } from 'lucide-react';

interface PayrollHeaderProps {
  lastUpdated?: string;
  isProcessing: boolean;
  onManualSync: () => void;
}

export const PayrollHeader: React.FC<PayrollHeaderProps> = ({
  lastUpdated,
  isProcessing,
  onManualSync
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <DollarSign className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Payroll</h1>
          <p className="text-gray-600">Manage employee payroll and payments</p>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last sync: {new Date(lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onManualSync}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Data
        </Button>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Payroll Settings
        </Button>
        <Select defaultValue="26 Jan 2024 — 25 Feb 2024">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="26 Jan 2024 — 25 Feb 2024">26 Jan 2024 — 25 Feb 2024</SelectItem>
            <SelectItem value="26 Dec 2023 — 25 Jan 2024">26 Dec 2023 — 25 Jan 2024</SelectItem>
            <SelectItem value="26 Nov 2023 — 25 Dec 2023">26 Nov 2023 — 25 Dec 2023</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
    </div>
  );
};
