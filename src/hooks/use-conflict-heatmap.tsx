
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { HeatmapData } from '@/types/conflict-heatmap';
import { conflictEngine } from '@/services/conflict-engine';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';

export const useConflictHeatmap = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isEnabled, setIsEnabled] = useState(false);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const { data: heatmapData, isLoading, error, refetch } = useQuery({
    queryKey: ['conflict-heatmap', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: () => conflictEngine.calculateConflicts(weekStart, weekEnd),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });

  const previousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const nextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  const toggleHeatmap = () => {
    setIsEnabled(prev => !prev);
  };

  const getConflictScore = (employeeId: string, timeSlot: string): number => {
    return heatmapData?.buckets[employeeId]?.[timeSlot]?.score || 0;
  };

  const getConflictColor = (score: number): string => {
    if (score === 0) return 'transparent';
    if (score <= 30) return 'hsl(var(--warning) / 0.3)';
    if (score <= 60) return 'hsl(var(--warning) / 0.6)';
    return 'hsl(var(--destructive) / 0.8)';
  };

  const getConflictViolations = (employeeId: string, timeSlot: string) => {
    return heatmapData?.buckets[employeeId]?.[timeSlot]?.violations || [];
  };

  return {
    heatmapData,
    isLoading,
    error,
    isEnabled,
    currentWeek,
    weekStart,
    weekEnd,
    previousWeek,
    nextWeek,
    goToCurrentWeek,
    toggleHeatmap,
    getConflictScore,
    getConflictColor,
    getConflictViolations,
    refetch
  };
};
