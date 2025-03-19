
import React from "react";

interface LeaveTypeBadgeProps {
  type: string;
}

const LeaveTypeBadge: React.FC<LeaveTypeBadgeProps> = ({ type }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${
      type === "Holiday" ? "bg-blue-100 text-blue-800" :
      type === "Sickness" ? "bg-red-100 text-red-800" :
      type === "Personal" ? "bg-purple-100 text-purple-800" :
      type === "Parental" ? "bg-green-100 text-green-800" :
      "bg-gray-100 text-gray-800"
    }`}>
      {type}
    </span>
  );
};

export default LeaveTypeBadge;
