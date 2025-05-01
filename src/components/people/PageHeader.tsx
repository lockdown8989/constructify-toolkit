
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Briefcase } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageHeaderProps {
  handleAddPerson: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ handleAddPerson }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-gray-800">Team Management</h2>
        <div className="ml-3 bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
          Manager View
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleAddPerson}
          className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'w-full justify-center min-h-[44px]' : 'rounded-full px-4'} py-2 flex items-center shadow-sm active-touch-state`}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Team Member
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
