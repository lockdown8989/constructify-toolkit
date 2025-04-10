
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
      <label htmlFor={`${label.toLowerCase()}-filter`} className="text-sm font-medium">
        {label}
      </label>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={isLoading}
      >
        <SelectTrigger id={`${label.toLowerCase()}-filter`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{placeholder}</SelectItem>
          {options.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterGroup;
