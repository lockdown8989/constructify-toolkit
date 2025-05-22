
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddShiftFABProps {
  onClick: () => void;
  isVisible: boolean;
}

const AddShiftFAB: React.FC<AddShiftFABProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg"
      variant="default"
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Add Shift</span>
    </Button>
  );
};

export default AddShiftFAB;
