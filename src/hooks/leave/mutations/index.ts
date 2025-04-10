
// Export all leave mutation hooks from a single file
export { useAddLeaveRequest } from './use-add-leave';
export { useUpdateLeaveRequest } from './use-update-leave';
export { useDeleteLeaveRequest } from './use-delete-leave';

// Add backward compatibility aliases
export const useAddLeaveCalendar = useAddLeaveRequest;
export const useUpdateLeaveCalendar = useUpdateLeaveRequest;
export const useDeleteLeaveCalendar = useDeleteLeaveRequest;
