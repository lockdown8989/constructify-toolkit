
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({
  to,
  icon: Icon,
  label,
  isActive = false,
  onClick,
  className
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    if (onClick) {
      onClick();
    }
  };

  const linkContent = (
    <>
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{label}</span>
    </>
  );

  const linkClasses = cn(
    "flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
    isActive && "bg-blue-50 text-blue-600 font-medium",
    className
  );

  return (
    <button
      onClick={handleClick}
      className={linkClasses}
      type="button"
    >
      {linkContent}
    </button>
  );
};

export default MobileNavLink;
