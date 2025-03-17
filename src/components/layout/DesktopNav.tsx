
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  name: string;
  path: string;
}

interface DesktopNavProps {
  navItems: NavItem[];
}

const DesktopNav: React.FC<DesktopNavProps> = ({ navItems }) => {
  const location = useLocation();
  
  const isActive = (path: string) => 
    (path === '/' && location.pathname === '/') || 
    (path !== '/' && location.pathname.startsWith(path));
  
  return (
    <nav className="bg-white px-1 py-1 rounded-full shadow-sm">
      <ul className="flex items-center space-x-1">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive(item.path) 
                  ? 'bg-black text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DesktopNav;
