
import * as AvailabilityModules from './availability';

// Re-export everything from the refactored modules
export * from './availability';

// Add a fallback export to ensure backward compatibility
export const useAvailability = AvailabilityModules.useAvailability;
