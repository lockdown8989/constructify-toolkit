
/**
 * Generates a unique identifier for the current device
 * This is used to identify the device that is being used for clock in/out
 */
export const getDeviceIdentifier = (): string => {
  // Try to get an existing identifier from local storage
  const existingIdentifier = localStorage.getItem('device_identifier');
  if (existingIdentifier) {
    return existingIdentifier;
  }

  // Generate a new identifier based on device info
  const navigatorInfo = navigator.userAgent;
  const screenInfo = `${window.screen.width}x${window.screen.height}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const languages = navigator.languages?.join(',') || navigator.language;
  
  // Create a simple hash from the combined info
  const combinedInfo = `${navigatorInfo}|${screenInfo}|${timeZone}|${languages}|${Date.now()}`;
  const hash = Array.from(combinedInfo)
    .reduce((acc, char) => {
      return (((acc << 5) - acc) + char.charCodeAt(0)) | 0;
    }, 0)
    .toString(36);
  
  const identifier = `device_${hash}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Save to localStorage for future use
  localStorage.setItem('device_identifier', identifier);
  
  return identifier;
};
