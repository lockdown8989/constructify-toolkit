
import React from 'react';
import CurrentDateTime from './CurrentDateTime';
import AccountTypeDisplay from '../layout/navigation/AccountTypeDisplay';

interface DashboardHeaderProps {
  firstName?: string;
  showAccountType?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  firstName = 'User', 
  showAccountType = true 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-4xl font-bold">Hello {firstName}</h1>
        {showAccountType && <AccountTypeDisplay />}
      </div>
      <CurrentDateTime className="md:w-auto w-full mt-4 md:mt-0" />
    </div>
  );
};

export default DashboardHeader;
