
import React from 'react';

interface MobileNavDividerProps {
  label?: string;
}

const MobileNavDivider: React.FC<MobileNavDividerProps> = ({ label }) => {
  return (
    <div className="px-2 my-2">
      {label ? (
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-500 px-4 py-1">{label}</span>
          <div className="h-px bg-gray-200 flex-grow"></div>
        </div>
      ) : (
        <div className="h-px bg-gray-200 w-full"></div>
      )}
    </div>
  );
};

export default MobileNavDivider;
