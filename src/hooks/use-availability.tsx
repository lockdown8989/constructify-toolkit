
// Re-export everything from the refactored modules
// This maintains backward compatibility with existing imports
export * from './availability';

// Add missing exports that components are looking for
export const useAvailabilityRequests = () => {
  console.warn('useAvailabilityRequests is deprecated. Use hooks from ./availability instead.');
  // Import and return the equivalent hook from the availability module
  const { useGetAvailability } = require('./availability');
  return useGetAvailability();
};

export const useCreateAvailabilityRequest = () => {
  console.warn('useCreateAvailabilityRequest is deprecated. Use hooks from ./availability instead.');
  // Import and return the equivalent hook from the availability module
  const { useCreateAvailability } = require('./availability');
  return useCreateAvailability();
};

export const useUpdateAvailabilityRequest = () => {
  console.warn('useUpdateAvailabilityRequest is deprecated. Use hooks from ./availability instead.');
  // Import and return the equivalent hook from the availability module
  const { useUpdateAvailability } = require('./availability');
  return useUpdateAvailability();
};
