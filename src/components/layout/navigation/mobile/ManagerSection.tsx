
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Settings, BarChart } from 'lucide-react';

export const ManagerSection: React.FC = () => {
  const navigate = useNavigate();

  const managerItems = [
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="space-y-1">
      {managerItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.href)}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.name}
          </button>
        );
      })}
    </div>
  );
};
