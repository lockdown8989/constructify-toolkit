
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MobileNavigationProps {
  activeSection: 'requests' | 'form';
  onSectionChange: (value: 'requests' | 'form') => void;
  isMobile: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeSection,
  onSectionChange,
  isMobile
}) => {
  if (!isMobile) return null;
  
  return (
    <div className="flex justify-center mb-4">
      <Tabs value={activeSection} onValueChange={(value) => onSectionChange(value as 'requests' | 'form')}>
        <TabsList>
          <TabsTrigger value="requests">View Requests</TabsTrigger>
          <TabsTrigger value="form">Create Request</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MobileNavigation;
