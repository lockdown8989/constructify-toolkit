
import React from 'react';
import { cn } from "@/lib/utils";

interface SidebarDividerProps {
  isCollapsed: boolean;
}

const SidebarDivider: React.FC<SidebarDividerProps> = ({ isCollapsed }) => {
  return (
    <div className={cn("h-[1px] bg-neutral-200 my-3", isCollapsed ? "mx-2" : "mx-6")} />
  );
};

export default SidebarDivider;
