
import { format } from 'date-fns';

export interface Meeting {
  id: string;
  title: string;
  time: string;
  participants: string[];
  location?: string;
}

export const SAMPLE_MEETINGS: Meeting[] = [
  {
    id: '1',
    title: 'Team Standup',
    time: `${format(new Date(), 'yyyy-MM-dd')} 09:30`,
    participants: ['John Doe', 'Jane Smith', 'Robert Johnson'],
    location: 'Meeting Room A'
  },
  {
    id: '2',
    title: 'Project Review',
    time: `${format(new Date(), 'yyyy-MM-dd')} 14:00`,
    participants: ['Michael Brown', 'Sarah Davis', 'James Wilson'],
    location: 'Conference Room'
  },
  {
    id: '3',
    title: 'Client Presentation',
    time: `${format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd')} 11:00`,
    participants: ['Emily Taylor', 'David Miller'],
    location: 'Zoom Meeting'
  },
  {
    id: '4',
    title: 'Monthly Review',
    time: `${format(new Date().setDate(new Date().getDate() + 2), 'yyyy-MM-dd')} 10:00`,
    participants: ['John Doe', 'Jane Smith', 'Sarah Davis', 'David Miller'],
    location: 'Meeting Room B'
  }
];
