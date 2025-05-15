
import { v4 as uuidv4 } from 'uuid';

// Generate a persistent device identifier
export const getDeviceIdentifier = () => {
  // Use existing device ID from local storage if available
  let deviceId = localStorage.getItem('device_identifier');
  
  // If not found, create a new one
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('device_identifier', deviceId);
  }
  
  return deviceId;
};
