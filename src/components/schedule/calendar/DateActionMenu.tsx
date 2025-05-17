
import React from 'react';
import { Film, UserPlus } from 'lucide-react';

interface DateActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShift: () => void;
  onAddEmployee: () => void;
  hasManagerAccess: boolean;
}

const DateActionMenu: React.FC<DateActionMenuProps> = ({
  isOpen,
  onClose,
  onAddShift,
  onAddEmployee,
  hasManagerAccess
}) => {
  if (!isOpen || !hasManagerAccess) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div 
        className="relative bg-white rounded-lg shadow-lg p-4 w-80 max-w-[90%] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div 
            className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={onAddShift}
          >
            <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center mr-4">
              <Film className="h-6 w-6 text-gray-600" />
            </div>
            <div className="text-xl font-semibold text-gray-800">Add shift</div>
          </div>
          
          <div 
            className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={onAddEmployee}
          >
            <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center mr-4">
              <UserPlus className="h-6 w-6 text-gray-600" />
            </div>
            <div className="text-xl font-semibold text-gray-800">Add employee</div>
          </div>
        </div>
        
        {/* Close button */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-16 w-14 h-14 bg-gray-400 hover:bg-gray-500 rounded-full flex items-center justify-center text-white cursor-pointer"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DateActionMenu;
