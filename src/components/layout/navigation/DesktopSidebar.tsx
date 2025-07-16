
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Settings,
  FileText,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface DesktopSidebarProps {
  isAuthenticated: boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isManager, isHR } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Time Clock', href: '/time-clock', icon: Clock },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Documents', href: '/documents', icon: FileText },
  ];

  // Add management items for managers, HR, and admins
  if (isManager || isAdmin || isHR) {
    navigationItems.push(
      { name: 'Employees', href: '/employees', icon: Users },
      { name: 'Settings', href: '/settings', icon: Settings }
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DesktopSidebar;
