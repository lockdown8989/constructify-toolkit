
import React from 'react';
import { format } from 'date-fns';
import { type Meeting } from '@/data/sample-meetings';

interface UpcomingEventsPanelProps {
  meetings: Meeting[];
}

const UpcomingEventsPanel: React.FC<UpcomingEventsPanelProps> = ({ meetings }) => {
  return (
    <div className="bg-white rounded-3xl p-6 card-shadow">
      <h2 className="text-xl font-medium mb-4">Upcoming Events</h2>
      <div className="space-y-4">
        {meetings.map(meeting => (
          <div 
            key={meeting.id}
            className="flex items-start border-l-4 border-blue-500 pl-4 py-2"
          >
            <div>
              <h3 className="font-medium">{meeting.title}</h3>
              <p className="text-sm text-gray-500">
                {format(new Date(meeting.time.replace(' ', 'T')), 'MMMM d, yyyy • h:mm a')}
              </p>
              <p className="text-sm text-gray-500">{meeting.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEventsPanel;
