
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Users, Calendar, FileText, Workflow, DollarSign, Receipt, Utensils, Clock, ClipboardCheck, Coffee, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useTimeClock } from "@/hooks/time-clock";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  isAuthenticated: boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ isAuthenticated }) => {
  const { isAdmin, isHR, isManager } = useAuth();
  const hasManagerialAccess = isManager || isAdmin || isHR;
  const isEmployee = isAuthenticated && !hasManagerialAccess;
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  const isClockingEnabled = !hasManagerialAccess && isAuthenticated;
  
  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const isActive = (path: string) => location.pathname === path;
  
  return (
    <div className={cn(
      "desktop-sidebar hidden lg:flex flex-col h-screen bg-[#f8f8f8]/95 border-r transition-all duration-300", 
      isCollapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <div className="flex items-center p-4 border-b">
        {!isCollapsed && (
          <div className="flex-1 text-center">
            <Link to="/" className="font-semibold text-lg">TeamPulse</Link>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto" 
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      
      {isClockingEnabled && !isCollapsed && (
        <div className="px-4 my-4">
          {status === 'clocked-out' ? (
            <Button 
              onClick={handleClockIn}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          ) : status === 'clocked-in' ? (
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleBreakStart}
                variant="outline"
                className="border-blue-300"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Break
              </Button>
              <Button 
                onClick={handleClockOut}
                className="bg-red-600 hover:bg-red-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                Out
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleBreakEnd}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              End Break
            </Button>
          )}
          
          <div className="text-center mt-2 text-sm">
            <Badge variant={status === 'clocked-in' ? 'default' : status === 'on-break' ? 'outline' : 'secondary'} 
              className={status === 'clocked-in' ? 'bg-green-100 text-green-800 border border-green-300' : 
                       status === 'on-break' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                       'bg-gray-100 text-gray-800 border border-gray-300'}>
              {status === 'clocked-in' ? 'Currently Clocked In' : 
               status === 'on-break' ? 'On Break' : 
               'Clocked Out'}
            </Badge>
          </div>
        </div>
      )}
      
      {isClockingEnabled && isCollapsed && (
        <div className="flex flex-col items-center gap-2 mt-4">
          {status === 'clocked-out' ? (
            <Button 
              onClick={handleClockIn}
              size="icon"
              title="Clock In"
              className="w-10 h-10 bg-green-600 hover:bg-green-700"
            >
              <Clock className="h-5 w-5" />
            </Button>
          ) : status === 'clocked-in' ? (
            <>
              <Button 
                onClick={handleBreakStart}
                size="icon"
                title="Start Break"
                variant="outline"
                className="w-10 h-10 border-blue-300"
              >
                <Coffee className="h-5 w-5" />
              </Button>
              <Button 
                onClick={handleClockOut}
                size="icon"
                title="Clock Out"
                className="w-10 h-10 bg-red-600 hover:bg-red-700"
              >
                <Clock className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleBreakEnd}
              size="icon"
              title="End Break"
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-5 w-5" />
            </Button>
          )}
          
          <div className="w-full flex justify-center mt-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              status === 'clocked-in' ? 'bg-green-500' : 
              status === 'on-break' ? 'bg-blue-500' : 
              'bg-gray-500'
            )} />
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <nav className={cn("grid gap-1 py-2", isCollapsed ? "px-2" : "px-2")}>
          <div
            onClick={handleHomeClick}
            className={cn(
              "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
              isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
              isActive("/dashboard") && "bg-white/90 text-primary"
            )}
          >
            <Home className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/dashboard") && "text-neutral-600")} />
            {!isCollapsed && <span>Home</span>}
          </div>
          
          <Link
            to="/about"
            className={cn(
              "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
              isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
              isActive("/about") && "bg-white/90 text-primary"
            )}
          >
            <FileText className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/about") && "text-neutral-600")} />
            {!isCollapsed && <span>About</span>}
          </Link>
          
          <Link
            to="/contact"
            className={cn(
              "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
              isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
              isActive("/contact") && "bg-white/90 text-primary"
            )}
          >
            <User className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/contact") && "text-neutral-600")} />
            {!isCollapsed && <span>Contact</span>}
          </Link>
          
          {isAuthenticated && (
            <>
              <div className={cn("h-[1px] bg-neutral-200 my-3", isCollapsed ? "mx-2" : "mx-6")} />
              
              {hasManagerialAccess && (
                <Link
                  to="/attendance"
                  className={cn(
                    "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
                    isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
                    isActive("/attendance") && "bg-white/90 text-primary"
                  )}
                >
                  <ClipboardCheck className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/attendance") && "text-neutral-600")} />
                  {!isCollapsed && <span>Attendance</span>}
                </Link>
              )}
              
              <Link
                to="/employee-workflow"
                className={cn(
                  "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
                  isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
                  isActive("/employee-workflow") && "bg-white/90 text-primary"
                )}
              >
                <Clock className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/employee-workflow") && "text-neutral-600")} />
                {!isCollapsed && <span>{hasManagerialAccess ? "My Employee Shifts" : "My Schedule"}</span>}
              </Link>
              
              {hasManagerialAccess && (
                <>
                  <Link
                    to="/people"
                    className={cn(
                      "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
                      isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
                      isActive("/people") && "bg-white/90 text-primary"
                    )}
                  >
                    <Users className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/people") && "text-neutral-600")} />
                    {!isCollapsed && <span>Team Members</span>}
                  </Link>
                  
                  <Link
                    to="/shift-calendar"
                    className={cn(
                      "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
                      isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
                      isActive("/shift-calendar") && "bg-white/90 text-primary"
                    )}
                  >
                    <Calendar className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/shift-calendar") && "text-neutral-600")} />
                    {!isCollapsed && <span>Restaurant Schedule</span>}
                  </Link>
                </>
              )}
              
              <Link
                to="/leave-management"
                className={cn(
                  "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
                  isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
                  isActive("/leave-management") && "bg-white/90 text-primary"
                )}
              >
                <Calendar className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/leave-management") && "text-neutral-600")} />
                {!isCollapsed && <span>Leave & Schedule</span>}
              </Link>
              
              <Link
                to="/salary"
                className={cn(
                  "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
                  isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
                  isActive("/salary") && "bg-white/90 text-primary"
                )}
              >
                <DollarSign className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/salary") && "text-neutral-600")} />
                {!isCollapsed && <span>Salary</span>}
              </Link>
              
              {hasManagerialAccess && (
                <Link
                  to="/payroll"
                  className={cn(
                    "flex items-center py-2 rounded-xl font-medium hover:bg-white/70 active:bg-white/90 transition-all",
                    isCollapsed ? "px-2 justify-center" : "px-4 mx-2",
                    isActive("/payroll") && "bg-white/90 text-primary"
                  )}
                >
                  <Receipt className={cn("h-5 w-5", isCollapsed ? "" : "mr-3", !isActive("/payroll") && "text-neutral-600")} />
                  {!isCollapsed && <span>Payslip</span>}
                </Link>
              )}
            </>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default DesktopSidebar;
