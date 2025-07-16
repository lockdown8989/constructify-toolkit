
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, FileText } from 'lucide-react';

interface WorkflowSectionProps {
  hasManagerialAccess: boolean;
  onClose: () => void;
}

const WorkflowSection: React.FC<WorkflowSectionProps> = ({ hasManagerialAccess, onClose }) => {
  const navigate = useNavigate();

  const workflowItems = [
    { name: 'Schedule Requests', href: '/schedule-requests', icon: CalendarCheck },
    { name: 'Reports', href: '/reports', icon: FileText },
  ];

  const handleNavigate = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div className="space-y-1">
      {workflowItems.map((item) => {
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

export default WorkflowSection;
