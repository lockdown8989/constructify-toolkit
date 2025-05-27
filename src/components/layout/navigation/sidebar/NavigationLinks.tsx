
import React from 'react';
import { 
  LayoutDashboard, FileText, User, Users, Calendar, 
  Workflow, DollarSign, Receipt, Clock, ClipboardCheck
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarNavLink from './SidebarNavLink';
import SidebarDivider from './SidebarDivider';

interface NavigationLinksProps {
  isAuthenticated: boolean;
  isCollapsed: boolean;
  hasManagerialAccess: boolean;
  currentPath: string;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({
  isAuthenticated,
  isCollapsed,
  hasManagerialAccess,
  currentPath
}) => {
  const isActive = (path: string) => currentPath === path;

  return (
    <ScrollArea className="h-full">
      <nav className={`grid gap-1 py-3 ${isCollapsed ? "px-2" : "px-3"}`}>
        {/* Common Links */}
        <SidebarNavLink
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={isActive("/dashboard")}
          isCollapsed={isCollapsed}
        />
        
        <SidebarNavLink
          to="/about"
          icon={FileText}
          label="About"
          isActive={isActive("/about")}
          isCollapsed={isCollapsed}
        />
        
        <SidebarNavLink
          to="/contact"
          icon={User}
          label="Contact"
          isActive={isActive("/contact")}
          isCollapsed={isCollapsed}
        />
        
        {isAuthenticated && (
          <>
            <SidebarDivider isCollapsed={isCollapsed} />
            
            {hasManagerialAccess && (
              <>
                <SidebarNavLink
                  to="/attendance"
                  icon={ClipboardCheck}
                  label="📊 Attendance"
                  isActive={isActive("/attendance")}
                  isCollapsed={isCollapsed}
                />
                
                {/* Add Manager Time Clock button with custom styling */}
                <SidebarNavLink
                  to="/manager-time-clock"
                  icon={Clock}
                  label="⏰️IN AND OUT⏱️"
                  isActive={isActive("/manager-time-clock")}
                  isCollapsed={isCollapsed}
                  className="time-clock-nav-button"
                />
              </>
            )}
            
            <SidebarNavLink
              to="/employee-workflow"
              icon={Clock}
              label={hasManagerialAccess ? "📋 Employee Shifts" : "📋 My Schedule"}
              isActive={isActive("/employee-workflow")}
              isCollapsed={isCollapsed}
            />
            
            {hasManagerialAccess && (
              <>
                <SidebarNavLink
                  to="/people"
                  icon={Users}
                  label="📍 Team Members"
                  isActive={isActive("/people")}
                  isCollapsed={isCollapsed}
                />
                
                <SidebarNavLink
                  to="/shift-calendar"
                  icon={Calendar}
                  label="📆 Schedule Calendar"
                  isActive={isActive("/shift-calendar")}
                  isCollapsed={isCollapsed}
                />
              </>
            )}
            
            <SidebarNavLink
              to="/leave-management"
              icon={Calendar}
              label="📑 Leave Management"
              isActive={isActive("/leave-management")}
              isCollapsed={isCollapsed}
            />
            
            <SidebarNavLink
              to="/salary"
              icon={DollarSign}
              label="💰 Salary"
              isActive={isActive("/salary")}
              isCollapsed={isCollapsed}
            />
            
            {hasManagerialAccess && (
              <SidebarNavLink
                to="/payroll"
                icon={Receipt}
                label="📝 Payroll"
                isActive={isActive("/payroll")}
                isCollapsed={isCollapsed}
              />
            )}
          </>
        )}
      </nav>
    </ScrollArea>
  );
};

export default NavigationLinks;
