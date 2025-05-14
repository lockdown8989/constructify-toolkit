
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
          <Link to="/" className="font-semibold text-lg">TeamPulse</Link>
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
