import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SecurityMetrics {
  failedAttempts: number;
  lastFailure: Date | null;
  isLocked: boolean;
  lockExpiry: Date | null;
}

interface SecurityConfig {
  maxFailedAttempts: number;
  lockoutDuration: number; // in minutes
  enableAuditLog: boolean;
}

export const useEnhancedSecurity = (config: SecurityConfig = {
  maxFailedAttempts: 5,
  lockoutDuration: 15,
  enableAuditLog: true
}) => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedAttempts: 0,
    lastFailure: null,
    isLocked: false,
    lockExpiry: null
  });
  
  const [auditLog, setAuditLog] = useState<Array<{
    action: string;
    timestamp: Date;
    details: string;
    severity: 'low' | 'medium' | 'high';
  }>>([]);
  
  const { toast } = useToast();

  // Check if account is locked
  const checkLockStatus = useCallback(() => {
    if (metrics.lockExpiry && new Date() > metrics.lockExpiry) {
      setMetrics(prev => ({
        ...prev,
        isLocked: false,
        lockExpiry: null,
        failedAttempts: 0
      }));
      return false;
    }
    return metrics.isLocked;
  }, [metrics.isLocked, metrics.lockExpiry]);

  // Record security event
  const recordSecurityEvent = useCallback((action: string, details: string, severity: 'low' | 'medium' | 'high' = 'medium') => {
    if (config.enableAuditLog) {
      setAuditLog(prev => [
        {
          action,
          timestamp: new Date(),
          details,
          severity
        },
        ...prev.slice(0, 99) // Keep last 100 events
      ]);
    }
  }, [config.enableAuditLog]);

  // Record failed attempt
  const recordFailedAttempt = useCallback((reason: string) => {
    const newFailedAttempts = metrics.failedAttempts + 1;
    const shouldLock = newFailedAttempts >= config.maxFailedAttempts;
    
    setMetrics(prev => ({
      ...prev,
      failedAttempts: newFailedAttempts,
      lastFailure: new Date(),
      isLocked: shouldLock,
      lockExpiry: shouldLock 
        ? new Date(Date.now() + config.lockoutDuration * 60 * 1000)
        : null
    }));

    recordSecurityEvent(
      'FAILED_OPERATION',
      `Failed attempt: ${reason}. Count: ${newFailedAttempts}`,
      shouldLock ? 'high' : 'medium'
    );

    if (shouldLock) {
      toast({
        title: "Account Temporarily Locked",
        description: `Too many failed attempts. Account locked for ${config.lockoutDuration} minutes.`,
        variant: "destructive",
      });
      
      recordSecurityEvent(
        'ACCOUNT_LOCKED',
        `Account locked after ${config.maxFailedAttempts} failed attempts`,
        'high'
      );
    }
  }, [metrics.failedAttempts, config.maxFailedAttempts, config.lockoutDuration, recordSecurityEvent, toast]);

  // Record successful operation
  const recordSuccess = useCallback((operation: string) => {
    // Reset failed attempts on success
    setMetrics(prev => ({
      ...prev,
      failedAttempts: 0,
      lastFailure: null
    }));

    recordSecurityEvent(
      'SUCCESSFUL_OPERATION',
      `Operation completed: ${operation}`,
      'low'
    );
  }, [recordSecurityEvent]);

  // Validate operation security
  const validateOperation = useCallback((operation: string): boolean => {
    if (checkLockStatus()) {
      toast({
        title: "Account Locked",
        description: "Your account is temporarily locked due to security concerns.",
        variant: "destructive",
      });
      return false;
    }

    recordSecurityEvent(
      'OPERATION_ATTEMPT',
      `Attempting operation: ${operation}`,
      'low'
    );

    return true;
  }, [checkLockStatus, recordSecurityEvent, toast]);

  // Get security summary
  const getSecuritySummary = useCallback(() => ({
    isSecure: !metrics.isLocked && metrics.failedAttempts < config.maxFailedAttempts / 2,
    riskLevel: metrics.failedAttempts === 0 ? 'low' : 
              metrics.failedAttempts < config.maxFailedAttempts / 2 ? 'medium' : 'high',
    failedAttempts: metrics.failedAttempts,
    maxAttempts: config.maxFailedAttempts,
    isLocked: metrics.isLocked,
    lockExpiry: metrics.lockExpiry,
    recentEvents: auditLog.slice(0, 5)
  }), [metrics, config.maxFailedAttempts, auditLog]);

  // Auto-check lock status periodically
  useEffect(() => {
    const interval = setInterval(checkLockStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkLockStatus]);

  return {
    validateOperation,
    recordFailedAttempt,
    recordSuccess,
    getSecuritySummary,
    isLocked: checkLockStatus(),
    metrics,
    auditLog: auditLog.slice(0, 20) // Return last 20 events
  };
};