
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface MobileNavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const MobileNavLink = ({ 
  to, 
  icon: Icon, 
  label, 
  onClick,
  disabled = false,
  className = ""
}: MobileNavLinkProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center py-3 px-4 mx-2 rounded-xl text-[15px] font-medium text-neutral-800 ${
        disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-white/70 active:bg-white/90'
      } transition-all touch-target ${className}`}
      aria-disabled={disabled}
    >
      <Icon className={`mr-3 h-5 w-5 ${className || 'text-neutral-600'}`} />
      <span>{label}</span>
    </Link>
  );
};

export default MobileNavLink;
