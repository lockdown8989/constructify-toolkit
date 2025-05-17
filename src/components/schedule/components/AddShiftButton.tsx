
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddShiftButtonProps {
  onClick: () => void;
  hasManagerAccess: boolean;
  className?: string;
}

const AddShiftButton: React.FC<AddShiftButtonProps> = ({ onClick, hasManagerAccess, className = "" }) => {
  if (!hasManagerAccess) {
    return null;
  }
  
  return (
    <Button 
      onClick={onClick}
      size="sm" 
      variant="default"
      className={`bg-blue-500 hover:bg-blue-600 text-white ${className}`}
    >
      <Plus className="h-4 w-4 mr-1" />
      Add Shift
    </Button>
  );
};

export default AddShiftButton;
