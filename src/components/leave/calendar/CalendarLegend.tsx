
import React from "react";

interface LegendItemProps {
  color: string;
  label: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => (
  <div className="flex items-center gap-1">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <span className="text-xs">{label}</span>
  </div>
);

const CalendarLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <LegendItem color="bg-blue-500" label="Holiday" />
      <LegendItem color="bg-red-500" label="Sickness" />
      <LegendItem color="bg-purple-500" label="Personal" />
      <LegendItem color="bg-green-500" label="Parental" />
      <LegendItem color="bg-gray-500" label="Other" />
    </div>
  );
};

export default CalendarLegend;
