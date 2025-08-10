import React, { useEffect, useRef } from 'react';
import { X, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  employeeName: string;
  onClose: () => void;
  isLoading?: boolean;
  showCloseIcon?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  employeeName,
  onClose,
  isLoading = false,
  showCloseIcon = true
}) => (
  <div className="flex-shrink-0 bg-background border-b border-border z-10 px-4 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" aria-hidden="true" />
          ) : (
            <Settings className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
          )}
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Edit Account</h1>
          <p className="text-sm text-muted-foreground" aria-label={`Editing account for ${employeeName}`}>
            {employeeName}
          </p>
        </div>
      </div>
      {showCloseIcon && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full android-touch-feedback touch-target"
          disabled={isLoading}
          aria-label="Close dialog"
        >
          <X className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </Button>
      )}
    </div>
  </div>
);

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = "Updating account..."
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  submitLabel?: string;
  disabled?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  isLoading,
  submitLabel = "Update Account",
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Handle iOS viewport changes
    const handleViewportChange = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const viewportHeight = visualViewport.height;
        const windowHeight = window.innerHeight;
        const keyboardHeight = windowHeight - viewportHeight;
        
        if (keyboardHeight > 100) {
          // Keyboard is open - move actions higher
          container.style.bottom = `${keyboardHeight}px`;
          container.style.paddingBottom = '0px';
        } else {
          // Keyboard is closed - return to bottom
          container.style.bottom = '0px';
          container.style.paddingBottom = 'env(safe-area-inset-bottom)';
        }
      }
    };
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="flex gap-3 pt-4 border-t border-border/50 fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-4 rounded-t-xl shadow-lg z-50 transition-all duration-200 ease-out"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Button 
        type="button"
        variant="outline" 
        onClick={onCancel} 
        className="flex-1 h-12 text-base android-touch-feedback touch-target"
        disabled={isLoading}
        aria-label="Cancel changes"
      >
        Cancel
      </Button>
      <Button 
        type="submit"
        onClick={onSubmit} 
        className="flex-1 h-12 text-base android-touch-feedback touch-target"
        disabled={isLoading || disabled}
        aria-label={isLoading ? "Updating account..." : submitLabel}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
            <span>Updating...</span>
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
};

interface ErrorMessageProps {
  error: string | null;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div 
      className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-800">Error</h4>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-red-500 hover:text-red-700"
            aria-label="Dismiss error message"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
};