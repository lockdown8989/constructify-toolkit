
import React from 'react';
import { Calendar, UserPlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShift: () => void;
  onAddEmployee: () => void;
  hasManagerAccess: boolean;
  selectedDate?: Date | null;
}

const DateActionMenu: React.FC<DateActionMenuProps> = ({
  isOpen,
  onClose,
  onAddShift,
  onAddEmployee,
  hasManagerAccess,
  selectedDate
}) => {
  if (!isOpen || !hasManagerAccess) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div 
        className="relative bg-white rounded-lg shadow-lg p-4 w-80 max-w-[90%] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {selectedDate && (
          <div className="text-center mb-3 text-sm font-medium text-gray-600">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </div>
        )}
        
        <div className="space-y-4">
          <div 
            className={cn(
              "flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200",
              "hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98]"
            )}
            onClick={onAddShift}
          >
            <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center mr-4 bg-blue-50">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-xl font-semibold text-gray-800">Add shift</div>
          </div>
          
          <div 
            className={cn(
              "flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200",
              "hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98]"
            )}
            onClick={onAddEmployee}
          >
            <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center mr-4 bg-green-50">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-xl font-semibold text-gray-800">Add employee</div>
          </div>
        </div>
        
        {/* Close button */}
        <button
          className={cn(
            "absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-16",
            "w-14 h-14 bg-gray-600 hover:bg-gray-700 active:bg-gray-800",
            "rounded-full flex items-center justify-center text-white cursor-pointer",
            "transition-colors shadow-lg"
          )}
          onClick={onClose}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default DateActionMenu;
