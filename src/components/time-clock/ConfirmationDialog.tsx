
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, Home, Coffee } from 'lucide-react';
import { format } from 'date-fns';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'in' | 'out' | 'break';
  employeeName: string;
  employeeAvatar?: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  employeeName,
  employeeAvatar
}) => {
  const currentTime = format(new Date(), 'HH:mm');
  
  const getHeaderColor = () => {
    switch (action) {
      case 'in': return 'bg-emerald-500';
      case 'out': return 'bg-red-600';
      case 'break': return 'bg-amber-500';
      default: return 'bg-gray-700';
    }
  };
  
  const getHeaderIcon = () => {
    switch (action) {
      case 'in': return <Check className="w-8 h-8 text-white" />;
      case 'out': return <Home className="w-8 h-8 text-white" />;
      case 'break': return <Coffee className="w-8 h-8 text-white" />;
      default: return null;
    }
  };
  
  const getActionText = () => {
    switch (action) {
      case 'in': return 'clocked in';
      case 'out': return 'clocked out';
      case 'break': return 'on break';
      default: return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[360px] p-0 overflow-hidden">
        <div className={`${getHeaderColor()} p-4 flex items-center justify-center`}>
          {getHeaderIcon()}
        </div>
        
        <div className="px-6 py-5">
          <div className="flex flex-col items-center justify-center">
            {employeeAvatar ? (
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                <img src={employeeAvatar} alt={employeeName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
            )}
            
            <h3 className="text-xl font-semibold mb-1">Hi {employeeName}</h3>
            <p className="text-muted-foreground mb-4">
              You're about to be {getActionText()} at 
            </p>
            <p className="text-3xl font-bold mb-4">{currentTime}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              className={`w-full ${action === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-600 hover:bg-red-700'}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
