
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";

interface CalendarFiltersProps {
  dateRange: DateRange | undefined;
  searchTerm: string;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onSearchTermChange: (term: string) => void;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  dateRange,
  searchTerm,
  onDateRangeChange,
  onSearchTermChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="w-full md:w-1/2">
        <DateRangePicker 
          dateRange={dateRange} 
          onDateRangeChange={onDateRangeChange} 
          className="w-full"
        />
      </div>
      <div className="w-full md:w-1/2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee or leave type"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
};

export default CalendarFilters;
