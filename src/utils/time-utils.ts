
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    console.error('Invalid duration value:', seconds);
    return '00:00:00';
  }
  
  try {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '00:00:00';
  }
}
