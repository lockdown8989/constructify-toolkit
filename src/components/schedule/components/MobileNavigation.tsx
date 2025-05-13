
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

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
  // Only show navigation controls on mobile
  if (!isMobile) return null;
  
  return (
    <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg mb-4">
      <Button
        variant={activeSection === 'requests' ? 'default' : 'outline'}
        size="sm"
        className="h-8 flex-1 mr-2"
        onClick={() => onSectionChange('requests')}
      >
        <FileText className="h-3.5 w-3.5 mr-1.5" />
        <span className="text-xs">Requests</span>
      </Button>
      <Button
        variant={activeSection === 'form' ? 'default' : 'outline'}
        size="sm"
        className="h-8 flex-1"
        onClick={() => onSectionChange('form')}
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        <span className="text-xs">New Request</span>
      </Button>
    </div>
  );
};

export default MobileNavigation;
