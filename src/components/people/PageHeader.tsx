
import React from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  handleAddPerson: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ handleAddPerson }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl md:text-4xl font-bold mb-1">My Employees</h1>
        <p className="text-gray-500">Manage your team members and their account permissions here</p>
      </div>
      
      <button 
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors self-start sm:self-center"
        onClick={handleAddPerson}
      >
        <Plus className="w-4 h-4 mr-2" />
        <span>Add person</span>
      </button>
    </div>
  );
};

export default PageHeader;
