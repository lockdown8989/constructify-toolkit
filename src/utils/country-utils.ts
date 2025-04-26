
// Map of country codes to full names
const countryMap: Record<string, string> = {
  "GB": "United Kingdom",
  "US": "United States",
  "CA": "Canada",
  "DE": "Germany",
  "FR": "France",
  "IT": "Italy",
  "ES": "Spain",
  "PL": "Poland",
  "RO": "Romania",
  "BG": "Bulgaria",
  // Add more as needed
};

export const getCountryName = (countryCode: string): string => {
  return countryMap[countryCode] || countryCode;
};

export const getCountryCode = (countryName: string): string | undefined => {
  return Object.entries(countryMap).find(([_, name]) => name === countryName)?.[0];
};
