import React from 'react';
import { X, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  employeeName: string;
  onClose: () => void;
  isLoading?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  employeeName,
  onClose,
  isLoading = false
}) => (
  <div className="flex-shrink-0 bg-white material-elevation-2 z-10 px-4 pt-4 pb-3 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center material-elevation-1">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" aria-hidden="true" />
          ) : (
            <Settings className="h-5 w-5 text-white" aria-hidden="true" />
          )}
        </div>
        <div>
          <h1 className="text-lg font-medium text-gray-900">Edit Account</h1>
          <p className="text-sm text-gray-600" aria-label={`Editing account for ${employeeName}`}>
            {employeeName}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-10 w-10 rounded android-touch-feedback touch-target"
        disabled={isLoading}
        aria-label="Close dialog"
      >
        <X className="h-5 w-5 text-gray-600" aria-hidden="true" />
      </Button>
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
}) => (
  <div className="flex gap-2 pt-4 border-t fixed bottom-0 left-0 right-0 bg-white p-4 rounded-t-xl shadow-lg z-40">
    <Button 
      type="button"
      variant="outline" 
      onClick={onCancel} 
      className="flex-1 ios-button"
      disabled={isLoading}
      aria-label="Cancel changes"
    >
      Cancel
    </Button>
    <Button 
      type="submit"
      onClick={onSubmit} 
      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white ios-button relative"
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