
import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  valueClassName,
}) => {
  return (
    <div 
      className={cn(
        "bg-white rounded-3xl p-6 card-shadow transition-all hover:translate-y-[-2px]",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-end space-x-2">
          <h2 
            className={cn(
              "text-4xl font-semibold",
              valueClassName
            )}
          >
            {value}
          </h2>
          
          {trend && (
            <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span className="inline-block mr-1">
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {trend.value}%
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
