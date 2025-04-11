
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative w-full md:w-auto md:min-w-[300px]">
      <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-apple-gray-500" />
      <input
        type="text"
        placeholder="Search employees..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-4 py-2.5 rounded-full bg-apple-gray-100/70 text-sm w-full focus:outline-none focus:ring-2 focus:ring-apple-blue/30 transition-all border-none shadow-sm placeholder:text-apple-gray-500"
      />
    </div>
  );
};

export default SearchBar;
