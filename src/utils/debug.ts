/**
 * Production-safe debug logging utility
 * Replaces console.log statements throughout the app
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = isDevelopment || localStorage.getItem('debug_mode') === 'true';

export const debug = {
  log: isDebugEnabled ? console.log : () => {},
  info: isDebugEnabled ? console.info : () => {},
  warn: console.warn, // Always show warnings
  error: console.error, // Always show errors
  
  // Conditional debug with categories
  auth: isDebugEnabled ? (message: string, ...args: any[]) => 
    console.log('🔐 AUTH:', message, ...args) : () => {},
    
  performance: isDebugEnabled ? (message: string, ...args: any[]) => 
    console.log('⚡ PERF:', message, ...args) : () => {},
    
  api: isDebugEnabled ? (message: string, ...args: any[]) => 
    console.log('🌐 API:', message, ...args) : () => {},
    
  employee: isDebugEnabled ? (message: string, ...args: any[]) => 
    console.log('👥 EMPLOYEE:', message, ...args) : () => {},
};

// Performance measurement utility
export const perf = {
  start: (label: string) => {
    if (isDebugEnabled) {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label: string) => {
    if (isDebugEnabled) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      debug.performance(`${label}: ${measure.duration.toFixed(2)}ms`);
    }
  }
};

// Usage examples:
// debug.auth('User signed in:', user);
// debug.employee('Loading employee data:', employeeId);
// perf.start('employee-list-render');
// perf.end('employee-list-render');