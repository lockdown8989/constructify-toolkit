
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Home, Coffee } from 'lucide-react';

interface ShiftCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFinishShift: () => Promise<void>;
  onGoOnBreak: () => Promise<void>;
  employeeName: string;
  employeeAvatar?: string;
  isSubmitting?: boolean;
}

const ShiftCompletionDialog: React.FC<ShiftCompletionDialogProps> = ({
  isOpen,
  onClose,
  onFinishShift,
  onGoOnBreak,
  employeeName,
  employeeAvatar,
  isSubmitting = false
}) => {
  const handleFinishShift = async () => {
    try {
      await onFinishShift();
      onClose();
    } catch (error) {
      console.error('Error finishing shift:', error);
      onClose();
    }
  };

  const handleGoOnBreak = async () => {
    try {
      await onGoOnBreak();
      onClose();
    } catch (error) {
      console.error('Error starting break:', error);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden bg-black text-white border border-gray-800">
        <div className="bg-gray-900 p-8 flex items-center justify-center">
          <div className="text-center">
            {employeeAvatar ? (
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4 mx-auto">
                <img src={employeeAvatar} alt={employeeName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl font-bold text-gray-300">{employeeName?.charAt(0) || '?'}</span>
              </div>
            )}
            <h3 className="text-2xl font-semibold text-white">{employeeName || 'Employee'}</h3>
          </div>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">What would you like to do?</h2>
            <p className="text-gray-400">Choose your next action</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Button 
              onClick={handleFinishShift}
              className="h-20 bg-red-600 hover:bg-red-700 text-white text-xl font-bold flex items-center justify-center gap-4 rounded-xl"
              disabled={isSubmitting}
            >
              <Home className="w-8 h-8" />
              FINISHED MY SHIFT
            </Button>
            
            <Button 
              onClick={handleGoOnBreak}
              className="h-20 bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold flex items-center justify-center gap-4 rounded-xl"
              disabled={isSubmitting}
            >
              <Coffee className="w-8 h-8" />
              GOING ON A BREAK
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-lg"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftCompletionDialog;
