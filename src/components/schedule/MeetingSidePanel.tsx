
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle, Clock } from 'lucide-react';
import { type Meeting } from '@/data/sample-meetings';

interface MeetingSidePanelProps {
  meetings: Meeting[];
  onAddMeeting: () => void;
}

const MeetingSidePanel: React.FC<MeetingSidePanelProps> = ({ meetings, onAddMeeting }) => {
  return (
    <div className="bg-white rounded-3xl p-6 card-shadow">
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
      
      <div className="space-y-4">
        {meetings
          .filter(meeting => {
            const [meetingDate] = meeting.time.split(" ");
            const isToday = meetingDate === format(new Date(), 'yyyy-MM-dd');
            const isTomorrow = meetingDate === format(
              new Date(new Date().setDate(new Date().getDate() + 1)), 
              'yyyy-MM-dd'
            );
            const isAfterTomorrow = meetingDate === format(
              new Date(new Date().setDate(new Date().getDate() + 2)), 
              'yyyy-MM-dd'
            );
            
            return isToday || isTomorrow || isAfterTomorrow;
          })
          .map(meeting => {
            const [meetingDate] = meeting.time.split(" ");
            const isToday = meetingDate === format(new Date(), 'yyyy-MM-dd');
            const isTomorrow = meetingDate === format(
              new Date(new Date().setDate(new Date().getDate() + 1)), 
              'yyyy-MM-dd'
            );
            
            return (
              <div 
                key={meeting.id}
                className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{meeting.title}</h4>
                  <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {isToday ? "Today" : isTomorrow ? "Tomorrow" : "In 2 days"}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-500 text-xs mb-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {meeting.time.split(" ")[1]}
                </div>
                
                {meeting.location && (
                  <div className="text-sm text-gray-500 mb-2">
                    {meeting.location}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MeetingSidePanel;
