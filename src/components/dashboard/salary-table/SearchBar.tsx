
import React from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value = '', onChange, onSearch }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (onChange) onChange(newValue);
    if (onSearch) onSearch(newValue);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={handleChange}
        className="pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 w-[200px]"
      />
    </div>
  );
};
