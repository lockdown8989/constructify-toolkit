
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Info } from 'lucide-react';
import { useConflictHeatmap } from '@/hooks/use-conflict-heatmap';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const HeatmapToggle: React.FC = () => {
  const { isEnabled, toggleHeatmap, isLoading, heatmapData } = useConflictHeatmap();

  const getTotalConflicts = () => {
    if (!heatmapData) return 0;
    
    let totalConflicts = 0;
    Object.values(heatmapData.buckets).forEach(employeeBuckets => {
      Object.values(employeeBuckets).forEach(bucket => {
        if (bucket.score > 0) totalConflicts++;
      });
    });
    
    return totalConflicts;
  };

  const totalConflicts = getTotalConflicts();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Button
          variant={isEnabled ? "default" : "outline"}
          size="sm"
          onClick={toggleHeatmap}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Thermometer className="h-4 w-4" />
          Conflict Heatmap
        </Button>
        
        {isEnabled && totalConflicts > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            {totalConflicts} conflicts
          </Badge>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <p className="font-medium">Conflict Heat Map</p>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-red-500 rounded" />
                  <span>Hard conflicts (double booking, labor violations)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-yellow-500 rounded" />
                  <span>Soft conflicts (overtime risk, preferences)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 bg-transparent border rounded" />
                  <span>No conflicts</span>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default HeatmapToggle;
