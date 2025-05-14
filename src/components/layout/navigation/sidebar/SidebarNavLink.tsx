
import React from 'react';
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  isActive, 
  isCollapsed,
  onClick 
}) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
        isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
        isActive && "bg-white/90 text-primary"
      )}
    >
      <Icon className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive && "text-neutral-600")} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

export default SidebarNavLink;
