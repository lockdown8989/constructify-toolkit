
import { useState, useEffect } from 'react';

interface AttendanceMetadata {
  location: string | null;
  deviceInfo: string | null;
}

export const useAttendanceMetadata = () => {
  const [metadata, setMetadata] = useState<AttendanceMetadata>({
    location: null,
    deviceInfo: null
  });

  useEffect(() => {
    // Get device information
    const userAgent = navigator.userAgent;
    const deviceInfo = {
      browser: getBrowser(userAgent),
      os: getOperatingSystem(userAgent),
      device: getDeviceType(userAgent)
    };

    setMetadata(prev => ({
      ...prev,
      deviceInfo: JSON.stringify(deviceInfo)
    }));

    // Get location if supported and permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setMetadata(prev => ({
            ...prev,
            location: JSON.stringify(locationData)
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  return metadata;
};

// Helper functions to parse user agent
const getBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
  return 'Unknown';
};

const getOperatingSystem = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
};

const getDeviceType = (userAgent: string): string => {
  if (userAgent.includes('Mobi')) return 'Mobile';
  if (userAgent.includes('iPad') || userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
};
