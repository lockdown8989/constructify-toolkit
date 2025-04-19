
export const generateShiftNotificationMessage = (
  title: string, 
  startTime: Date, 
  endTime: Date
) => {
  const formattedStartTime = startTime.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  const formattedEndTime = endTime.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return `📅 Shift Assignment: ${title}\n🕒 ${formattedStartTime} - ${formattedEndTime}`;
};

export const getShiftNotificationIcon = (shiftType: string) => {
  switch (shiftType.toLowerCase()) {
    case 'morning': return '🌅';
    case 'evening': return '🌆';
    case 'night': return '🌃';
    default: return '📅';
  }
};
