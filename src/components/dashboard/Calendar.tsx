
import React, { useState } from 'react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Meeting {
  id: string;
  title: string;
  time: string;
  date: Date;
  dotColor?: 'yellow' | 'black';
}

interface CalendarProps {
  meetings: Meeting[];
  className?: string;
}

interface TimelineEventProps {
  time: string;
  title: string;
  dotColor?: 'yellow' | 'black';
  isMobile?: boolean;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({ time, title, dotColor = 'yellow', isMobile = false }) => {
  return (
    <div className="flex items-start py-3 group animate-fade-in">
      <div className="w-12 sm:w-14 text-right mr-2 sm:mr-3">
        <div className="text-xs text-gray-500 font-medium">{time}</div>
      </div>
      
      <div className="relative flex-1">
        <div className="absolute left-0 top-0 mt-1.5 -ml-1.5 w-3 h-3 rounded-full bg-white border-2 border-gray-100">
          <div className={cn(
            "w-2 h-2 rounded-full absolute inset-0 m-auto",
            dotColor === 'yellow' ? 'bg-crextio-accent' : 'bg-black'
          )} />
        </div>
        
        <div className="pl-4 pb-6 border-l border-gray-200">
          <div className={cn(
            "p-2 sm:p-3 rounded-xl text-xs sm:text-sm transition-all",
            dotColor === 'yellow' ? 'bg-crextio-accent/10' : 'bg-gray-100'
          )}>
            {title}
          </div>
        </div>
      </div>
    </div>
  );
};

const Calendar: React.FC<CalendarProps> = ({ meetings, className }) => {
  const [currentDate] = useState(new Date());
  const isMobile = useIsMobile();
  
  // Generate week days
  const getWeekDays = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  };
  
  const weekDays = getWeekDays();
  const displayDays = isMobile ? weekDays.slice(0, 5) : weekDays;
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const displayLabels = isMobile ? dayLabels.slice(0, 5) : dayLabels;
  
  return (
    <div className={cn("bg-white rounded-3xl p-4 sm:p-6 card-shadow", className)}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-medium">Schedule</h3>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Week days */}
      <div className={cn(
        "grid gap-2 mb-4 sm:mb-6",
        isMobile ? "grid-cols-5" : "grid-cols-7"
      )}>
        {displayLabels.map((day, i) => (
          <div key={day} className="text-center">
            <div className="text-xs text-gray-500 mb-1">{day}</div>
            <div className={cn(
              "text-xs sm:text-sm py-1 rounded-full",
              day === 'Wed' ? 'bg-gray-900 text-white' : 'text-gray-700'
            )}>
              {format(displayDays[i], 'd')}
            </div>
          </div>
        ))}
      </div>
      
      {/* Timeline */}
      <div className="space-y-1">
        {meetings.map(meeting => (
          <TimelineEvent 
            key={meeting.id}
            time={meeting.time}
            title={meeting.title}
            dotColor={meeting.dotColor}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
};

export default Calendar;
