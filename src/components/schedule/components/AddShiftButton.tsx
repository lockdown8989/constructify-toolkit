
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddShiftButtonProps {
  onClick: () => void;
  hasManagerAccess: boolean;
}

const AddShiftButton: React.FC<AddShiftButtonProps> = ({ onClick, hasManagerAccess }) => {
  if (!hasManagerAccess) {
    return null;
  }
  
  return (
    <Button 
      onClick={onClick}
      size="sm" 
      className="rounded-full h-10 w-10 p-0 bg-blue-500 hover:bg-blue-600 shadow-md"
    >
      <Plus className="h-5 w-5" />
    </Button>
  );
};

export default AddShiftButton;
