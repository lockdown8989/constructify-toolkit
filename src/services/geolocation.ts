
interface GeolocationResponse {
  country: string;
  country_code: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  timezone: {
    name: string;
    offset: number;
  };
}

export const detectUserLocation = async (): Promise<{
  country: string;
  countryCode: string;
  timezone: string;
  timezoneOffset: number;
}> => {
  try {
    // Using free IP geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json() as {
      country_name: string;
      country_code: string;
      timezone: string;
      utc_offset: string;
    };
    
    // Parse timezone offset from API response (format: +HHMM or -HHMM)
    let timezoneOffset = 0;
    if (data.utc_offset) {
      const sign = data.utc_offset.charAt(0) === '-' ? -1 : 1;
      const hours = parseInt(data.utc_offset.substring(1, 3), 10);
      const minutes = parseInt(data.utc_offset.substring(3, 5), 10);
      timezoneOffset = sign * (hours * 60 + minutes);
    }
    
    return {
      country: data.country_name || '',
      countryCode: data.country_code || '',
      timezone: data.timezone || '',
      timezoneOffset: timezoneOffset
    };
  } catch (error) {
    console.error('Error detecting location:', error);
    
    // Fallback to browser's timezone API
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset() * -1; // Browser returns opposite sign
    
    return {
      country: '',
      countryCode: '',
      timezone: timezone || 'UTC',
      timezoneOffset: offset
    };
  }
};
