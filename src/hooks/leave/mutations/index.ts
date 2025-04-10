
// Import the hooks first
import { useAddLeaveRequest as addLeaveRequestHook } from './use-add-leave';
import { useUpdateLeaveRequest as updateLeaveRequestHook } from './use-update-leave';
import { useDeleteLeaveRequest as deleteLeaveRequestHook } from './use-delete-leave';

// Re-export the hooks with their original names
export const useAddLeaveRequest = addLeaveRequestHook;
export const useUpdateLeaveRequest = updateLeaveRequestHook;
export const useDeleteLeaveRequest = deleteLeaveRequestHook;

// Add backward compatibility aliases
export const useAddLeaveCalendar = useAddLeaveRequest;
export const useUpdateLeaveCalendar = updateLeaveRequestHook;
export const useDeleteLeaveCalendar = deleteLeaveRequestHook;
