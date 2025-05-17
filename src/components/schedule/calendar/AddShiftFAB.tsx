
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddShiftFABProps {
  onClick: () => void;
  isVisible: boolean;
}

const AddShiftFAB: React.FC<AddShiftFABProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-16 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 p-0 flex items-center justify-center"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};

export default AddShiftFAB;
