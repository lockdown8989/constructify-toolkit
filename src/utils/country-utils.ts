
// Function to convert country codes to full names
export const getCountryName = (countryCode: string): string => {
  const countryMappings: Record<string, string> = {
    "GB": "United Kingdom",
    "US": "United States",
    "CA": "Canada",
    "DE": "Germany",
    "FR": "France",
    "IT": "Italy",
    "ES": "Spain",
    // Add more mappings as needed
  };
  
  return countryMappings[countryCode] || countryCode;
};
