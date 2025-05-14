
import React from 'react';
import { Home, FileText, User, Users, Calendar, Workflow, DollarSign, Receipt, Clock, ClipboardCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import SidebarNavLink from './SidebarNavLink';
import SidebarDivider from './SidebarDivider';

interface NavigationLinksProps {
  isAuthenticated: boolean;
  isCollapsed: boolean;
  hasManagerialAccess: boolean;
  handleHomeClick: () => void;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({
  isAuthenticated,
  isCollapsed,
  hasManagerialAccess,
  handleHomeClick
}) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <ScrollArea className="flex-1">
      <nav className={`grid gap-1 py-2 ${isCollapsed ? "px-2" : "px-2"}`}>
        {/* Common Links */}
        <div
          onClick={handleHomeClick}
        >
          <SidebarNavLink
            to="/dashboard"
            icon={Home}
            label="Home"
            isActive={isActive("/dashboard")}
            isCollapsed={isCollapsed}
          />
        </div>
        
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
              <SidebarNavLink
                to="/attendance"
                icon={ClipboardCheck}
                label="Attendance"
                isActive={isActive("/attendance")}
                isCollapsed={isCollapsed}
              />
            )}
            
            <SidebarNavLink
              to="/employee-workflow"
              icon={Clock}
              label={hasManagerialAccess ? "My Employee Shifts" : "My Schedule"}
              isActive={isActive("/employee-workflow")}
              isCollapsed={isCollapsed}
            />
            
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
              label="Leave & Schedule"
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
                label="Payslip"
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
