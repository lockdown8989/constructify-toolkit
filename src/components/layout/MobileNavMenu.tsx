
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, Bell } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
}

interface MobileNavMenuProps {
  navItems: NavItem[];
  currentPath: string;
  onItemClick: () => void;
  onSignOut: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
  navItems,
  currentPath,
  onItemClick,
  onSignOut
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => 
    (path === '/' && location.pathname === '/') || 
    (path !== '/' && location.pathname.startsWith(path));
  
  return (
    <div className="fixed inset-0 z-40 pt-16 pb-6 px-4 bg-white/95 backdrop-blur-md animate-fade-in overflow-auto">
      <nav className="pt-4">
        <ul className="flex flex-col items-stretch space-y-2">
          {navItems.map((item) => (
            <li key={item.name} className="w-full">
              <Link
                to={item.path}
                onClick={onItemClick}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all w-full text-center ${
                  isActive(item.path) 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            </li>
          ))}
          
          <li className="w-full">
            <button
              onClick={onSignOut}
              className="block px-4 py-3 rounded-xl text-base font-medium transition-all w-full text-center text-red-600 bg-red-50 hover:bg-red-100"
            >
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="mt-8 flex justify-center space-x-6">
        <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
        <button className="w-12 h-12 rounded-full flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
          <Bell className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default MobileNavMenu;
