import React from 'react';
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  state: 'idle' | 'loading' | 'success' | 'error';
  loadingText?: string;
  successText?: string;
  errorText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  state,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Error occurred',
  size = 'md',
  className,
  showIcon = true
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base'
  };

  const iconSize = sizeClasses[size];

  if (state === 'idle') return null;

  return (
    <div 
      className={cn(
        'flex items-center gap-2 transition-all duration-200',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {showIcon && (
        <>
          {state === 'loading' && (
            <Loader2 className={cn(iconSize, 'animate-spin text-blue-600')} aria-hidden="true" />
          )}
          {state === 'success' && (
            <CheckCircle className={cn(iconSize, 'text-green-600')} aria-hidden="true" />
          )}
          {state === 'error' && (
            <AlertCircle className={cn(iconSize, 'text-red-600')} aria-hidden="true" />
          )}
        </>
      )}
      
      <span className={cn(
        'font-medium',
        {
          'text-blue-700': state === 'loading',
          'text-green-700': state === 'success',
          'text-red-700': state === 'error',
        },
        sizeClasses[size].split(' ')[2] // Extract text size class
      )}>
        {state === 'loading' && loadingText}
        {state === 'success' && successText}
        {state === 'error' && errorText}
      </span>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  circle = false,
  count = 1
}) => {
  const skeletonElement = (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        circle ? 'rounded-full' : 'rounded',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      aria-hidden="true"
    />
  );

  if (count === 1) return skeletonElement;

  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{skeletonElement}</div>
      ))}
    </div>
  );
};

interface ProgressIndicatorProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'default',
  className
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600'
  };

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-gray-700 dark:text-gray-300">{label}</span>}
          {showPercentage && (
            <span className="text-gray-500 dark:text-gray-400">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div 
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress: ${Math.round(clampedProgress)}%`}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            variantClasses[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  label = 'Loading'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center" role="status" aria-label={label}>
      <Loader2 
        className={cn(
          'animate-spin text-blue-600',
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};