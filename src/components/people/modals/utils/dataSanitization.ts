
export const sanitizeString = (str: any): string | null => {
  if (typeof str !== 'string') return null;
  const trimmed = str.trim();
  return trimmed === '' ? null : trimmed;
};

export const sanitizeNumber = (num: any): number => {
  if (typeof num === 'number' && !isNaN(num)) return num;
  if (typeof num === 'string') {
    const parsed = parseFloat(num);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const ensureBoolean = (val: any): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return Boolean(val);
};

export const ensureTimeString = (time: any): string => {
  if (typeof time === 'string' && time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }
  return '09:00';
};
