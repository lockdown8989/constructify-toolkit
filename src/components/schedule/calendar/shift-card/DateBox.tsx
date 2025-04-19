
import React from 'react';
import { format } from 'date-fns';
import { useStatusStyles } from '@/hooks/use-status-styles';

interface DateBoxProps {
  startTime: Date;
  status: string;
}

export const DateBox: React.FC<DateBoxProps> = ({ startTime, status }) => {
  const { getDateBoxStyles } = useStatusStyles();
  
  return (
    <div className={getDateBoxStyles(status)}>
      <span className="text-xs font-medium">
        {format(startTime, 'MMM').toUpperCase()}
      </span>
      <span className="text-lg font-bold">
        {format(startTime, 'd')}
      </span>
    </div>
  );
};
