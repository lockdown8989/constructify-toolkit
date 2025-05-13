
import React from 'react';
import { Button } from '@/components/ui/button';
import { ListFilter, Plus } from 'lucide-react';

interface MobileNavigationProps {
  activeSection: 'requests' | 'form';
  onSectionChange: (section: 'requests' | 'form') => void;
  isMobile: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeSection,
  onSectionChange,
  isMobile
}) => {
  if (!isMobile) return null;
  
  return (
    <div className="flex gap-2 mb-4 bg-gray-50/80 p-2 rounded-lg shadow-sm">
      <Button
        variant={activeSection === 'requests' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSectionChange('requests')}
        className="flex-1 flex items-center justify-center active-touch-state text-xs py-2"
      >
        <ListFilter className="h-3.5 w-3.5 mr-1.5" />
        View Requests
      </Button>
      <Button
        variant={activeSection === 'form' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSectionChange('form')}
        className="flex-1 flex items-center justify-center active-touch-state text-xs py-2"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        New Request
      </Button>
    </div>
  );
};

export default MobileNavigation;
