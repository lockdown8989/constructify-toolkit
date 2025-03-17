
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: 'black' | 'yellow' | 'gray' | 'green';
  showValue?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  maxValue = 100,
  color = 'black',
  showValue = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  const isMobile = useIsMobile();
  
  const colorClasses = {
    black: 'bg-black',
    yellow: 'bg-crextio-accent',
    gray: 'bg-gray-200',
    green: 'bg-crextio-success',
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        {showValue && <div className="text-xs text-gray-500">{value}%</div>}
      </div>
      
      <div className={cn(
        "w-full bg-gray-100 rounded-full overflow-hidden",
        isMobile ? "h-6" : "h-8"
      )}>
        <div 
          className={cn(
            "h-full progress-bar transition-all duration-500 ease-out rounded-full",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
