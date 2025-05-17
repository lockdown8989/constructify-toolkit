
import { getHours, getMinutes } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';

export const getEventPosition = (schedule: Schedule) => {
  const startTime = new Date(schedule.start_time);
  const endTime = new Date(schedule.end_time);
  
  const startHour = getHours(startTime) + getMinutes(startTime) / 60;
  const endHour = getHours(endTime) + getMinutes(endTime) / 60;
  
  const top = (startHour - 9) * 60; // 9am is our starting hour
  const height = (endHour - startHour) * 60;
  
  return { top, height };
};

export const getEventColor = (index: number) => {
  const colors = [
    'bg-blue-100/80 border-blue-500 hover:bg-blue-200/80',
    'bg-purple-100/80 border-purple-500 hover:bg-purple-200/80',
    'bg-green-100/80 border-green-500 hover:bg-green-200/80',
    'bg-amber-100/80 border-amber-500 hover:bg-amber-200/80',
    'bg-pink-100/80 border-pink-500 hover:bg-pink-200/80',
  ];
  
  return colors[index % colors.length];
};
