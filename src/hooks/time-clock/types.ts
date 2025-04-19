
export type TimeClockStatus = 'clocked-in' | 'clocked-out' | 'on-break';

export type TimelogEntry = {
  type: 'clock-in' | 'break-start' | 'break-end' | 'clock-out';
  timestamp: Date;
};
