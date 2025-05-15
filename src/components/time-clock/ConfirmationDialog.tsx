
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Home, Coffee } from 'lucide-react';
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
  const currentTime = format(new Date(), 'HH:mm:ss');
  
  const getActionText = () => {
    switch (action) {
      case 'in': return 'clocked in';
      case 'out': return 'clocked out';
      case 'break': return 'on break';
      default: return '';
    }
  };
  
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[360px] p-0 overflow-hidden bg-black text-white border border-gray-800">
        <div className={`${getHeaderColor()} p-6 flex items-center justify-center`}>
          {getHeaderIcon()}
        </div>
        
        <div className="px-6 py-8">
          <div className="flex flex-col items-center justify-center">
            {employeeAvatar ? (
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                <img src={employeeAvatar} alt={employeeName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-gray-300">{employeeName.charAt(0)}</span>
              </div>
            )}
            
            <h3 className="text-2xl font-semibold mb-2">Hi {employeeName}</h3>
            <p className="text-gray-400 mb-4 text-center">
              You're about to be {getActionText()} at 
            </p>
            <p className="text-4xl font-bold mb-6">{currentTime}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button 
              variant="outline" 
              className="w-full text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white" 
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
