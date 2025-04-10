
interface GeolocationResponse {
  country: string;
  country_code: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
}

export const detectUserLocation = async (): Promise<{
  country: string;
  currencyCode: 'USD' | 'GBP' | 'EUR';
}> => {
  try {
    // Using free IP geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json() as GeolocationResponse;
    
    // Map country codes to supported currencies
    let currencyCode: 'USD' | 'GBP' | 'EUR' = 'USD'; // Default
    
    if (data.currency.code === 'GBP') {
      currencyCode = 'GBP';
    } else if (data.currency.code === 'EUR' || 
              ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 
               'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES'].includes(data.country_code)) {
      currencyCode = 'EUR';
    }
    
    return {
      country: data.country || '',
      currencyCode
    };
  } catch (error) {
    console.error('Error detecting location:', error);
    return {
      country: '',
      currencyCode: 'USD' // Default fallback
    };
  }
};
