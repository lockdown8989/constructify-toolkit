
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';

export default function DateRangeFilter() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-12 px-4 rounded-xl border-gray-200 min-w-[200px] justify-start">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Pick a date range
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </PopoverContent>
    </Popover>
  );
}
