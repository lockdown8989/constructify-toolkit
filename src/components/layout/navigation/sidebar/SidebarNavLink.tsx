
import React from 'react';
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const link = (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "sidebar-link",
        isActive && "active"
      )}
    >
      <Icon className={cn("sidebar-link-icon", !isActive && "text-neutral-600")} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {link}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
};

export default SidebarNavLink;
