
// Re-export all availability-related hooks
export * from './use-fetch-availability';
export * from './use-create-availability';
export * from './use-update-availability';
export * from './use-delete-availability';

// Export core types for availability
export interface Availability {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: string;
  notes?: string | null;
}

// Add compatibility layer for existing code
export const useAvailabilityRequests = (employeeId?: string) => {
  const { useAvailabilityRequests: useRequests } = require('./use-fetch-availability');
  return useRequests(employeeId);
};

export const useCreateAvailabilityRequest = () => {
  const { useCreateAvailabilityRequest: useCreate } = require('./use-create-availability');
  return useCreate();
};

export const useUpdateAvailabilityRequest = () => {
  const { useUpdateAvailabilityRequest: useUpdate } = require('./use-update-availability');
  return useUpdate();
};

export const useDeleteAvailabilityRequest = () => {
  const { useDeleteAvailabilityRequest: useDelete } = require('./use-delete-availability');
  return useDelete();
};
