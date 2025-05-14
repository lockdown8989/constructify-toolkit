
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  className?: string;
}

const SidebarNavLink = ({
  to,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  className
}: SidebarNavLinkProps) => {
  const link = (
    <NavLink
      to={to}
      className={({ isActive: routeIsActive }) =>
        cn(
          "flex items-center gap-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
          isActive || routeIsActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground",
          className
        )
      }
    >
      <Icon className={cn(
        "flex-shrink-0",
        isCollapsed ? "h-5 w-5 mx-auto" : "h-5 w-5",
      )} />
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" align="center" className="z-50">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
};

export default SidebarNavLink;
