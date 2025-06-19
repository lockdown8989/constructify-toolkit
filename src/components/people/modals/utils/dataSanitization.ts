
export const sanitizeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export const sanitizeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value);
  return isNaN(num) ? 0 : num;
};

export const ensureBoolean = (value: any): boolean => {
  console.log('🔍 Converting to boolean:', { value, type: typeof value });
  
  // Handle explicit boolean values
  if (typeof value === 'boolean') {
    console.log('✅ Already boolean:', value);
    return value;
  }
  
  // Handle string representations
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    const result = lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
    console.log('✅ String to boolean:', { original: value, result });
    return result;
  }
  
  // Handle numbers (0 = false, non-zero = true)
  if (typeof value === 'number') {
    const result = value !== 0;
    console.log('✅ Number to boolean:', { original: value, result });
    return result;
  }
  
  // Default fallback - treat null/undefined as false, everything else as true
  const result = value != null;
  console.log('✅ Default boolean conversion:', { original: value, result });
  return result;
};

export const ensureTimeString = (value: any): string => {
  if (value === null || value === undefined) return '09:00';
  const timeString = String(value).trim();
  
  // Validate time format (HH:MM)
  if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
    console.warn('Invalid time format, defaulting to 09:00:', timeString);
    return '09:00';
  }
  
  return timeString;
};
