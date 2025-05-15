
import React from 'react';
import { 
  Home, FileText, User, Users, Calendar, 
  Workflow, DollarSign, Receipt, Clock, ClipboardCheck,
  LayoutDashboard, Settings, Timer
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
  const isEmployee = isAuthenticated && !hasManagerialAccess;

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
                  label="Attendance"
                  isActive={isActive("/attendance")}
                  isCollapsed={isCollapsed}
                />

                <SidebarNavLink
                  to="/manager-time-clock"
                  icon={Timer}
                  label="Employee Clock"
                  isActive={isActive("/manager-time-clock")}
                  isCollapsed={isCollapsed}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                />
              </>
            )}
            
            <SidebarNavLink
              to="/employee-workflow"
              icon={Clock}
              label={hasManagerialAccess ? "Employee Shifts" : "Overview"}
              isActive={isActive("/employee-workflow")}
              isCollapsed={isCollapsed}
            />
            
            {/* Calendar link - only for employees */}
            {isEmployee && (
              <SidebarNavLink
                to="/employee-calendar"
                icon={Calendar}
                label="My Calendar"
                isActive={isActive("/employee-calendar")}
                isCollapsed={isCollapsed}
              />
            )}
            
            {hasManagerialAccess && (
              <>
                <SidebarNavLink
                  to="/people"
                  icon={Users}
                  label="Team Members"
                  isActive={isActive("/people")}
                  isCollapsed={isCollapsed}
                />
                
                <SidebarNavLink
                  to="/shift-calendar"
                  icon={Calendar}
                  label="Restaurant Schedule"
                  isActive={isActive("/shift-calendar")}
                  isCollapsed={isCollapsed}
                />
              </>
            )}
            
            <SidebarNavLink
              to="/leave-management"
              icon={Calendar}
              label="Leave Management"
              isActive={isActive("/leave-management")}
              isCollapsed={isCollapsed}
            />
            
            <SidebarNavLink
              to="/salary"
              icon={DollarSign}
              label="Salary"
              isActive={isActive("/salary")}
              isCollapsed={isCollapsed}
            />
            
            {hasManagerialAccess && (
              <SidebarNavLink
                to="/payroll"
                icon={Receipt}
                label="Payroll"
                isActive={isActive("/payroll")}
                isCollapsed={isCollapsed}
              />
            )}
            
            <SidebarDivider isCollapsed={isCollapsed} />
            
            <SidebarNavLink
              to="/settings"
              icon={Settings}
              label="Settings"
              isActive={isActive("/settings")}
              isCollapsed={isCollapsed}
            />
          </>
        )}
      </nav>
    </ScrollArea>
  );
};

export default NavigationLinks;
