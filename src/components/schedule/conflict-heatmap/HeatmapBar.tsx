
import React from 'react';
import { format, addMinutes } from 'date-fns';
import { useConflictHeatmap } from '@/hooks/use-conflict-heatmap';
import { ConflictViolation } from '@/types/conflict-heatmap';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeatmapBarProps {
  employeeId: string;
  startTime: Date;
  endTime: Date;
  className?: string;
}

const HeatmapBar: React.FC<HeatmapBarProps> = ({
  employeeId,
  startTime,
  endTime,
  className = ''
}) => {
  const { getConflictScore, getConflictColor, getConflictViolations, isEnabled } = useConflictHeatmap();

  if (!isEnabled) return null;

  // Create time segments for the bar
  const segments: Array<{
    time: Date;
    score: number;
    color: string;
    violations: ConflictViolation[];
  }> = [];

  let currentTime = new Date(startTime);
  const SEGMENT_MINUTES = 30;

  while (currentTime < endTime) {
    const timeSlot = format(currentTime, "yyyy-MM-dd'T'HH:mm");
    const score = getConflictScore(employeeId, timeSlot);
    const color = getConflictColor(score);
    const violations = getConflictViolations(employeeId, timeSlot);

    segments.push({
      time: new Date(currentTime),
      score,
      color,
      violations
    });

    currentTime = addMinutes(currentTime, SEGMENT_MINUTES);
  }

  const formatViolations = (violations: ConflictViolation[]) => {
    if (violations.length === 0) return 'No conflicts';
    
    return violations.map(v => (
      <div key={v.rule} className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          v.type === 'hard' ? 'bg-red-500' : 'bg-yellow-500'
        }`} />
        <span>{v.description}</span>
      </div>
    ));
  };

  return (
    <TooltipProvider>
      <div className={`flex h-3 rounded-sm overflow-hidden border ${className}`}>
        {segments.map((segment, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div
                className="flex-1 min-w-[2px] cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: segment.color }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {format(segment.time, 'HH:mm')} - {format(addMinutes(segment.time, SEGMENT_MINUTES), 'HH:mm')}
                </p>
                <p className="text-sm">Conflict Score: {segment.score}</p>
                <div className="space-y-1">
                  {formatViolations(segment.violations)}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default HeatmapBar;
