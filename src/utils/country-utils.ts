
// Map of ISO country codes to country names
const countryCodeMap: Record<string, string> = {
  'US': 'United States',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia', 
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'JP': 'Japan',
  'CN': 'China',
  'IN': 'India',
  'BR': 'Brazil',
  'RU': 'Russia',
  'MX': 'Mexico',
  'ZA': 'South Africa',
  'AR': 'Argentina',
  'PL': 'Poland',
  'BG': 'Bulgaria',
  'RO': 'Romania',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'IE': 'Ireland',
  'NZ': 'New Zealand',
  'SG': 'Singapore',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'VN': 'Vietnam',
  'TR': 'Turkey',
  'EG': 'Egypt',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'IL': 'Israel',
};

/**
 * Converts a country code to a country name
 * @param countryCode The ISO country code (e.g., 'US', 'GB')
 * @returns The full country name or the original code if not found
 */
export const getCountryName = (countryCode: string): string => {
  if (!countryCode) return '';
  
  const normalizedCode = countryCode.toUpperCase();
  return countryCodeMap[normalizedCode] || countryCode;
};

/**
 * Get a list of countries as options for a select input
 * @returns Array of country options with value and label
 */
export const getCountryOptions = () => {
  return Object.entries(countryCodeMap).map(([code, name]) => ({
    value: code,
    label: name
  }));
};
