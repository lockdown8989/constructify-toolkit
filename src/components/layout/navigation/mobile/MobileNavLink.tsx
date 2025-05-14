
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MobileNavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, icon: Icon, label, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 hover:bg-white/70 active:bg-white/90 transition-all touch-target"
    >
      <Icon className="mr-3 h-5 w-5 text-neutral-600" />
      <span>{label}</span>
    </Link>
  );
};

export default MobileNavLink;
