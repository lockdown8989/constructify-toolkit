
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, FileText, Clock } from 'lucide-react';

interface CommonSectionProps {
  isAuthenticated: boolean;
  isEmployee: boolean;
  hasManagerialAccess: boolean;
  isPayroll: boolean;
  onClose: () => void;
}

const CommonSection: React.FC<CommonSectionProps> = ({
  isAuthenticated,
  onClose
}) => {
  const navigate = useNavigate();

  const commonItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Time Clock', href: '/time-clock', icon: Clock },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Documents', href: '/documents', icon: FileText },
  ];

  if (!isAuthenticated) {
    return null;
  }

  const handleNavigate = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="space-y-1">
      {commonItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.name}
            onClick={() => handleNavigate(item.href)}
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

export default CommonSection;
