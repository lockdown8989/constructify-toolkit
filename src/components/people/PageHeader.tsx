
import React from 'react';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  handleAddPerson: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ handleAddPerson }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-1.5 text-apple-gray-900 tracking-tight">My Employees</h1>
        <p className="text-apple-gray-600 text-sm md:text-base">Manage your team members and their account permissions here</p>
      </div>
      
      <button 
        className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium h-10 px-5 py-2 bg-apple-blue text-white hover:bg-apple-blue/90 transition-colors self-start sm:self-center shadow-sm"
        onClick={handleAddPerson}
      >
        <Plus className="w-4 h-4 mr-2" />
        <span>Add person</span>
      </button>
    </div>
  );
};

export default PageHeader;
