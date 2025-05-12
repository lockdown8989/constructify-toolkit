
import React from 'react';
import { cn } from '@/lib/utils';

interface SalaryStatCardProps {
  title: string;
  value: string;
  secondaryValue?: string;
  bgColor?: string;
  titleClassName?: string;
  valueClassName?: string;
}

const SalaryStatCard: React.FC<SalaryStatCardProps> = ({
  title,
  value,
  secondaryValue,
  bgColor = "bg-gray-100",
  titleClassName,
  valueClassName
}) => {
  return (
    <div className={cn("rounded-xl overflow-hidden", bgColor)}>
      <div className="p-4">
        <p className={cn("text-sm font-medium text-gray-500 mb-1", titleClassName)}>
          {title}
        </p>
        <p className={cn("text-xl font-bold", valueClassName)}>
          {value}
        </p>
        {secondaryValue && (
          <p className={cn("text-xs mt-1", titleClassName || "text-gray-500")}>
            {secondaryValue}
          </p>
        )}
      </div>
    </div>
  );
};

export default SalaryStatCard;
