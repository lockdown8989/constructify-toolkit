
import React from 'react';
import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isCollapsed, toggleCollapse }) => {
  return (
    <div className="flex items-center p-4 border-b">
      {!isCollapsed && (
        <div className="flex-1 text-center">
          <Link to="/" className="flex items-center justify-center gap-2">
            <img 
              src="/lovable-uploads/2fa83748-5338-4dcb-9c43-f84070f43aec.png" 
              alt="TeamPulse Logo" 
              className="h-8 w-auto animate-bounce hover:animate-spin hover:scale-110 transition-all duration-500 cursor-pointer"
            />
            <span className="font-semibold text-lg">TeamPulse</span>
          </Link>
        </div>
      )}
      <Button 
        variant="ghost" 
        size="icon" 
        className="ml-auto" 
        onClick={toggleCollapse}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>
    </div>
  );
};

export default SidebarHeader;
