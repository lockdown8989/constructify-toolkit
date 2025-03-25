
import React from 'react';
import { cn } from '@/lib/utils';

interface SalaryStatCardProps {
  title: string;
  value: string;
  secondaryValue?: string;
  bgColor?: string;
  valueClassName?: string;
  titleClassName?: string;
  icon?: React.ReactNode;
}

const SalaryStatCard: React.FC<SalaryStatCardProps> = ({
  title,
  value,
  secondaryValue,
  bgColor = "bg-white",
  valueClassName,
  titleClassName,
  icon,
}) => {
  return (
    <div className={cn(
      "rounded-2xl p-4 flex flex-col justify-between h-24",
      bgColor
    )}>
      <div className={cn(
        "text-sm font-medium flex items-center",
        titleClassName
      )}>
        {icon && <span className="mr-2">{icon}</span>}
        {title}
      </div>
      
      <div className="flex items-baseline">
        <div className={cn(
          "text-xl font-bold",
          valueClassName
        )}>
          {value}
        </div>
        
        {secondaryValue && (
          <div className={cn(
            "ml-2 text-sm text-gray-600",
            valueClassName
          )}>
            / {secondaryValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryStatCard;
