
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Employee } from '@/hooks/use-employees';

interface EmployeeHeaderProps {
  employee: Employee;
  onBack: () => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ employee, onBack }) => {
  const isMobile = useIsMobile();

  return (
    <div className="relative h-44 bg-gradient-to-r from-amber-200 to-amber-500 overflow-hidden">
      {isMobile && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 left-2 text-white bg-black/20 hover:bg-black/30"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      )}
      
      <div className="absolute -bottom-12 w-full flex flex-col items-center">
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
          {employee.avatar ? (
            <img 
              src={employee.avatar} 
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 text-xl">
              {employee.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHeader;
