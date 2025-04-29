
import React from 'react';
import { Search, Trash2, Download, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TableControlsProps {
  isMobile: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
}

const TableControls: React.FC<TableControlsProps> = ({
  isMobile,
  searchQuery,
  onSearchChange,
  selectedCount
}) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 px-4 sm:px-6">
        <div className="relative flex-grow max-w-md mb-4 sm:mb-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search team members..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end space-x-2">
          {selectedCount > 0 && (
            <>
              <span className="text-sm text-gray-600 mr-2">{selectedCount} selected</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-200 hover:bg-gray-50 hover:text-gray-700 rounded-lg"
          >
            <Printer className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Print</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableControls;
