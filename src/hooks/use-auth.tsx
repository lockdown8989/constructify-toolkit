
// Re-export auth hooks from the new implementation
export * from './auth';

// Add specific exports for backward compatibility
export { AuthProvider } from './auth/AuthProvider';
export { useAuthActions } from './auth/useAuthActions';
