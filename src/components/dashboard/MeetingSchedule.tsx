
import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Meeting {
  id: string;
  title: string;
  time: string;
  participants: string[];
  location?: string;
}

interface MeetingScheduleProps {
  meetings?: Meeting[];
  className?: string;
  onAddMeeting?: () => void;
}

const MeetingSchedule: React.FC<MeetingScheduleProps> = ({ 
  meetings = [], 
  className,
  onAddMeeting
}) => {
  const isMobile = useIsMobile();
  const [currentDate] = useState<Date>(new Date());
  
  // Generate the next 3 days (today + 2 more days)
  const getDays = () => {
    return Array.from({ length: 3 }).map((_, i) => addDays(currentDate, i));
  };
  
  const days = getDays();
  
  // Get meetings for a specific day
  const getMeetingsForDay = (day: Date): Meeting[] => {
    return meetings.filter(meeting => {
      const [meetingDate] = meeting.time.split(" "); // Format: "YYYY-MM-DD HH:MM"
      return meetingDate === format(day, "yyyy-MM-dd");
    });
  };
  
  // Sort meetings by time
  const sortMeetings = (meetings: Meeting[]): Meeting[] => {
    return [...meetings].sort((a, b) => {
      const timeA = a.time.split(" ")[1]; // Get HH:MM
      const timeB = b.time.split(" ")[1];
      return timeA.localeCompare(timeB);
    });
  };

  return (
    <div className={cn("bg-white rounded-3xl p-4 sm:p-6 card-shadow", className)}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-medium">Meeting Schedule</h3>
        
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          onClick={onAddMeeting}
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          <span className="hidden sm:inline">Add Meeting</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {days.map((day, index) => {
          const dayMeetings = sortMeetings(getMeetingsForDay(day));
          const isToday = index === 0;
          
          return (
            <div 
              key={format(day, "yyyy-MM-dd")}
              className={cn(
                "p-4 rounded-xl",
                isToday ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
              )}
            >
              <div className="flex items-center mb-3">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-medium">
                  {isToday ? "Today" : format(day, "EEEE")}
                </span>
                <span className="text-gray-500 ml-2 text-sm">
                  {format(day, "MMM d")}
                </span>
              </div>
              
              {dayMeetings.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No meetings scheduled
                </div>
              ) : (
                <div className="space-y-3">
                  {dayMeetings.map(meeting => (
                    <div 
                      key={meeting.id}
                      className="bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{meeting.title}</h4>
                        <div className="flex items-center text-gray-500 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {meeting.time.split(" ")[1]}
                        </div>
                      </div>
                      
                      {meeting.location && (
                        <div className="text-sm text-gray-500 mb-2">
                          {meeting.location}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {meeting.participants.slice(0, 3).map((participant, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {participant}
                          </Badge>
                        ))}
                        {meeting.participants.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{meeting.participants.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MeetingSchedule;
