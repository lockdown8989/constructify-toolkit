
import React, { useState } from 'react';
import PeopleTable from '@/components/people/PeopleTable';
import { Plus, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const People = () => {
  const isMobile = useIsMobile();
  
  // Sample data
  const sampleEmployees = [
    {
      id: '1',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      name: 'Yulia Polishchuk',
      jobTitle: 'Head of Design',
      department: 'Design',
      site: 'Remote',
      siteIcon: '🌐',
      salary: '$2,500',
      startDate: 'Jan 10, 2022',
      lifecycle: 'Active',
      status: 'Active',
      statusColor: 'green' as const,
    },
    {
      id: '2',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Bogdan Nikitin',
      jobTitle: 'Front End Developer',
      department: 'Engineering',
      site: 'Kyiv Office',
      siteIcon: '🏢',
      salary: '$3,000',
      startDate: 'Mar 15, 2022',
      lifecycle: 'Active',
      status: 'Active',
      statusColor: 'green' as const,
    },
    {
      id: '3',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      name: 'Daria Yurchenko',
      jobTitle: 'UX/UI Designer',
      department: 'Design',
      site: 'Remote',
      siteIcon: '🌐',
      salary: '$1,500',
      startDate: 'Feb 22, 2022',
      lifecycle: 'Active',
      status: 'Active',
      statusColor: 'green' as const,
    },
    {
      id: '4',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
      name: 'Artem Komarov',
      jobTitle: 'Product Manager',
      department: 'Product',
      site: 'Kyiv Office',
      siteIcon: '🏢',
      salary: '$4,000',
      startDate: 'Apr 5, 2022',
      lifecycle: 'Active',
      status: 'Leave',
      statusColor: 'gray' as const,
    },
    {
      id: '5',
      avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
      name: 'Alina Kobets',
      jobTitle: 'Backend Developer',
      department: 'Engineering',
      site: 'Remote',
      siteIcon: '🌐',
      salary: '$3,200',
      startDate: 'Jan 20, 2022',
      lifecycle: 'Active',
      status: 'Active',
      statusColor: 'green' as const,
    },
  ];
  
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-1">People</h1>
            <p className="text-gray-500">Manage your team members and their account permissions here</p>
          </div>
          
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors self-start sm:self-center">
            <Plus className="w-4 h-4 mr-2" />
            <span>Add person</span>
          </button>
        </div>
        
        {/* Search - Mobile Only */}
        {isMobile && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm w-full focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        )}
        
        {/* People Table */}
        <PeopleTable employees={sampleEmployees} />
      </div>
    </div>
  );
};

export default People;
