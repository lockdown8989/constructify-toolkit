import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SecurityContextType {
  reportSecurityIncident: (incident: SecurityIncident) => void;
  validateCSRF: (token: string) => boolean;
}

interface SecurityIncident {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access' | 'xss_attempt';
  details: string;
  timestamp?: Date;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { toast } = useToast();

  // Security incident reporting
  const reportSecurityIncident = (incident: SecurityIncident) => {
    console.warn('Security Incident:', {
      ...incident,
      timestamp: incident.timestamp || new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // In production, send to security monitoring service
    // Example: SecurityService.reportIncident(incident);

    // Show user-friendly message for certain incident types
    if (incident.type === 'rate_limit_exceeded') {
      toast({
        title: "Too Many Requests",
        description: "Please wait a moment before trying again.",
        variant: "destructive"
      });
    }
  };

  // CSRF token validation (basic implementation)
  const validateCSRF = (token: string): boolean => {
    // In production, validate against server-generated token
    // For now, basic validation
    return token && token.length > 10 && /^[a-zA-Z0-9]+$/.test(token);
  };

  // Security headers check on mount
  useEffect(() => {
    // Check for basic security headers via test requests
    const checkSecurityHeaders = async () => {
      try {
        const response = await fetch('/api/health', { method: 'HEAD' });
        const headers = response.headers;
        
        const missingHeaders = [];
        if (!headers.get('x-content-type-options')) missingHeaders.push('X-Content-Type-Options');
        if (!headers.get('x-frame-options')) missingHeaders.push('X-Frame-Options');
        if (!headers.get('strict-transport-security')) missingHeaders.push('Strict-Transport-Security');
        
        if (missingHeaders.length > 0) {
          console.warn('Missing security headers:', missingHeaders);
        }
      } catch (error) {
        // Silently ignore if health endpoint doesn't exist
      }
    };

    checkSecurityHeaders();
  }, []);

  // Monitor for suspicious DOM manipulation
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for suspicious script injections
              if (element.tagName === 'SCRIPT' && !element.hasAttribute('data-allowed')) {
                reportSecurityIncident({
                  type: 'xss_attempt',
                  details: `Suspicious script injection detected: ${element.innerHTML.slice(0, 100)}`
                });
                element.remove();
              }

              // Check for suspicious iframes
              if (element.tagName === 'IFRAME' && !element.hasAttribute('data-allowed')) {
                const src = element.getAttribute('src');
                if (src && !src.startsWith(window.location.origin)) {
                  reportSecurityIncident({
                    type: 'xss_attempt',
                    details: `Suspicious iframe detected: ${src}`
                  });
                  element.remove();
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, []);

  const value: SecurityContextType = {
    reportSecurityIncident,
    validateCSRF
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};