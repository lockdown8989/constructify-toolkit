
import React from 'react';
import { Bell, Settings } from 'lucide-react';
import UserDropdown from './UserDropdown';

interface NavActionsProps {
  userEmail: string | undefined;
  userRole: string;
  isMobile: boolean;
  onSignOut: () => void;
}

const NavActions: React.FC<NavActionsProps> = ({ 
  userEmail, 
  userRole, 
  isMobile, 
  onSignOut 
}) => {
  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      {!isMobile && (
        <>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </>
      )}
      
      <UserDropdown 
        email={userEmail} 
        role={userRole} 
        onSignOut={onSignOut} 
      />
    </div>
  );
};

export default NavActions;
