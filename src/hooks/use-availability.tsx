
// This file is kept for backward compatibility
// It re-exports all availability functionality from the new modular files
export * from './availability';

// Add a fallback export to ensure backward compatibility
export const useAvailability = () => {
  const { useAvailability: useAvailFunc } = require('./availability');
  return useAvailFunc();
};
