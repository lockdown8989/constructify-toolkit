
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PoundSterling, Download, Settings, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportPayrollData } from '@/hooks/use-payroll-export';
import { getPayrollPeriods } from '@/utils/payroll/periods';
import { toast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();

  // Payroll period (26th — 25th) selector
  const periods = useMemo(() => getPayrollPeriods(6, new Date()), []);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState<string>(periods[0]?.key);
  const selectedPeriod = useMemo(
    () => periods.find((p) => p.key === selectedPeriodKey) || periods[0],
    [periods, selectedPeriodKey]
  );

  const [exporting, setExporting] = useState(false);

  const handlePayrollSettings = () => {
    navigate('/payroll-settings');
  };

  const handleExport = async () => {
    if (!selectedPeriod) return;
    try {
      setExporting(true);
      await exportPayrollData('GBP', selectedPeriod.start, selectedPeriod.end);
      toast({ title: 'Export complete', description: `CSV for ${selectedPeriod.label} downloaded.` });
    } catch (error) {
      console.error('Export error', error);
      toast({ title: 'Export failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <PoundSterling className="h-6 w-6 text-blue-600" />
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
        <Button 
          variant="outline" 
          size="sm"
          onClick={handlePayrollSettings}
        >
          <Settings className="h-4 w-4 mr-2" />
          Payroll Settings
        </Button>
        <Select value={selectedPeriodKey} onValueChange={setSelectedPeriodKey}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder={selectedPeriod?.label} />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.key} value={p.key}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleExport} disabled={exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export CSV
        </Button>
      </div>
    </div>
  );
};
