
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAttachPayslipToEmployee } from '@/hooks/use-payroll-documents';
import { Upload } from 'lucide-react';

interface PayslipUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

const PayslipUploadDialog: React.FC<PayslipUploadDialogProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentPeriod, setPaymentPeriod] = useState('');
  const attachPayslip = useAttachPayslipToEmployee();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !paymentPeriod) {
      return;
    }

    try {
      await attachPayslip.mutateAsync({
        employeeId,
        payslipFile: selectedFile,
        paymentPeriod
      });

      // Reset form and close dialog
      setSelectedFile(null);
      setPaymentPeriod('');
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPaymentPeriod('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Payslip for {employeeName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-period" className="text-sm font-medium">
              Payment Period
            </Label>
            <Input
              id="payment-period"
              type="text"
              placeholder="e.g., December 2024"
              value={paymentPeriod}
              onChange={(e) => setPaymentPeriod(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="payslip-file" className="text-sm font-medium">
              Payslip File (PDF)
            </Label>
            <Input
              id="payslip-file"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-2"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !paymentPeriod || attachPayslip.isPending}
          >
            <Upload className="h-4 w-4 mr-2" />
            {attachPayslip.isPending ? 'Uploading...' : 'Upload Payslip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PayslipUploadDialog;
