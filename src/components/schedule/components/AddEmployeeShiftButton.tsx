
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

interface AddEmployeeShiftButtonProps {
  onClick: () => void;
  className?: string;
}

const AddEmployeeShiftButton: React.FC<AddEmployeeShiftButtonProps> = ({ onClick, className = "" }) => {
  const { isAdmin, isManager, isHR } = useAuth();
  const hasManagerAccess = isAdmin || isManager || isHR;
  
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
      Add Employee Shift
    </Button>
  );
};

export default AddEmployeeShiftButton;
