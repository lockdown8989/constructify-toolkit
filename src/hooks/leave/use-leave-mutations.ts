
// This file is kept for backward compatibility
// It re-exports all leave mutations from the new modular files
export * from './mutations';

// Real-time subscription removed to prevent CHANNEL_ERROR spam that was causing auth crashes
