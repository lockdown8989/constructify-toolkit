
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterGroupProps {
  label: string;
  options: string[];
  value: string | undefined;
  onChange: (value: string) => void;
  isLoading: boolean;
  placeholder: string;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  label,
  options,
  value,
  onChange,
  isLoading,
  placeholder,
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={`${label.toLowerCase()}-filter`} className="text-sm font-medium text-apple-gray-700">
        {label}
      </label>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger 
          id={`${label.toLowerCase()}-filter`}
          className="rounded-xl border-apple-gray-200 focus:ring-apple-blue/20 bg-apple-gray-50/50"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-apple-gray-200">
          <SelectItem value="all" className="text-muted-foreground">{placeholder}</SelectItem>
          {options.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterGroup;
