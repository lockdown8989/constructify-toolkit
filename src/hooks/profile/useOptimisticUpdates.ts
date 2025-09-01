import { useState, useCallback } from 'react';

interface PendingUpdate {
  id: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export const useOptimisticUpdates = () => {
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  const [optimisticData, setOptimisticData] = useState<any>(null);

  const optimisticUpdate = useCallback((updateId: string, data: any) => {
    // Apply optimistic update immediately
    setOptimisticData(data);
    
    // Track pending update
    setPendingUpdates(prev => [
      ...prev.filter(u => u.id !== updateId),
      {
        id: updateId,
        data,
        timestamp: Date.now(),
        retryCount: 0
      }
    ]);
  }, []);

  const confirmUpdate = useCallback((updateId: string) => {
    setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
  }, []);

  const revertUpdate = useCallback((updateId: string) => {
    setPendingUpdates(prev => prev.filter(u => u.id !== updateId));
    setOptimisticData(null);
  }, []);

  const retryUpdate = useCallback((updateId: string) => {
    setPendingUpdates(prev => prev.map(u => 
      u.id === updateId 
        ? { ...u, retryCount: u.retryCount + 1, timestamp: Date.now() }
        : u
    ));
  }, []);

  const clearPendingUpdates = useCallback(() => {
    setPendingUpdates([]);
    setOptimisticData(null);
  }, []);

  return {
    optimisticUpdate,
    confirmUpdate,
    revertUpdate,
    retryUpdate,
    clearPendingUpdates,
    pendingUpdates,
    optimisticData,
    hasPendingUpdates: pendingUpdates.length > 0
  };
};