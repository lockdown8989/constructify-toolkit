import React, { useRef, useCallback } from 'react';
import { debug, perf } from '@/utils/debug';

/**
 * Hook for performance monitoring and optimization
 */
export const usePerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  // Track component renders
  renderCount.current++;
  const currentTime = Date.now();
  const timeSinceLastRender = currentTime - lastRenderTime.current;
  lastRenderTime.current = currentTime;

  debug.performance(`${componentName} render #${renderCount.current}, ${timeSinceLastRender}ms since last`);

  const measureOperation = useCallback((operationName: string) => {
    const label = `${componentName}-${operationName}`;
    
    return {
      start: () => perf.start(label),
      end: () => perf.end(label)
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    measureOperation
  };
};

/**
 * Hook for memoizing expensive computations
 */
export const useMemoizedComputation = <T>(
  computation: () => T,
  dependencies: any[],
  debugLabel?: string
) => {
  const memoizedValue = React.useMemo(() => {
    if (debugLabel) {
      perf.start(`memo-${debugLabel}`);
    }
    
    const result = computation();
    
    if (debugLabel) {
      perf.end(`memo-${debugLabel}`);
    }
    
    return result;
  }, dependencies);

  return memoizedValue;
};