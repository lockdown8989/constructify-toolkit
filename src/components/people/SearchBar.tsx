
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative w-full md:w-auto md:min-w-[280px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-apple-gray-600" />
      <input
        type="text"
        placeholder="Search employees..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-9 pr-4 py-2.5 rounded-xl bg-apple-gray-100 text-sm w-full focus:outline-none focus:ring-2 focus:ring-apple-blue/30 transition-all border-none shadow-sm"
      />
    </div>
  );
};

export default SearchBar;
