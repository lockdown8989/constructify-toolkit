
import React from 'react';
import { X } from 'lucide-react';

interface MobileNavHeaderProps {
  onClose: () => void;
}

const MobileNavHeader: React.FC<MobileNavHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
      <button
        onClick={onClose}
        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close menu</span>
      </button>
    </div>
  );
};

export default MobileNavHeader;
