
import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface SalaryStatCardProps {
  title: string;
  value: string;
  secondaryValue?: string;
  bgColor?: string;
  valueClassName?: string;
  titleClassName?: string;
}

export const SalaryStatCard: React.FC<SalaryStatCardProps> = ({
  title,
  value,
  secondaryValue,
  bgColor = 'bg-white',
  valueClassName,
  titleClassName,
}) => {
  return (
    <Card className={cn("p-4 rounded-xl", bgColor)}>
      <h3 className={cn("text-sm font-medium mb-2", titleClassName)}>
        {title}
      </h3>
      <div className="space-y-1">
        <p className={cn("text-2xl font-bold", valueClassName)}>
          {value}
        </p>
        {secondaryValue && (
          <p className="text-sm text-gray-500">
            {secondaryValue}
          </p>
        )}
      </div>
    </Card>
  );
};

export default SalaryStatCard;
