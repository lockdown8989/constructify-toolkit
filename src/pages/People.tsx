
import React, { useState } from 'react';
import PeopleTable from '@/components/people/PeopleTable';
import ProgressBar from '@/components/dashboard/ProgressBar';

const People = () => {
  // Sample data
  const sampleEmployees = [
    {
      id: '1',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Anatoly Belik',
      jobTitle: 'Head of Design',
      department: 'Product',
      site: 'Stockholm',
      siteIcon: '🇸🇪',
      salary: '$1,350',
      startDate: 'Mar 13, 2023',
      lifecycle: 'Hired',
      status: 'Invited',
      statusColor: 'green' as const,
    },
    {
      id: '2',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      name: 'Ksenia Bator',
      jobTitle: 'Fullstack Engineer',
      department: 'Engineering',
      site: 'Miami',
      siteIcon: '🇺🇸',
      salary: '$1,500',
      startDate: 'Oct 13, 2023',
      lifecycle: 'Hired',
      status: 'Absent',
      statusColor: 'gray' as const,
      selected: true,
    },
    {
      id: '3',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      name: 'Bogdan Nikitin',
      jobTitle: 'Mobile Lead',
      department: 'Product',
      site: 'Kyiv',
      siteIcon: '🇺🇦',
      salary: '$2,600',
      startDate: 'Nov 4, 2023',
      lifecycle: 'Employed',
      status: 'Invited',
      statusColor: 'green' as const,
      selected: true,
    },
    {
      id: '4',
      avatar: 'https://randomuser.me/api/portraits/men/59.jpg',
      name: 'Arsen Yatsenko',
      jobTitle: 'Sales Manager',
      department: 'Operations',
      site: 'Ottawa',
      siteIcon: '🇨🇦',
      salary: '$900',
      startDate: 'Sep 4, 2021',
      lifecycle: 'Employed',
      status: 'Invited',
      statusColor: 'green' as const,
    },
    {
      id: '5',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      name: 'Daria Yurchenko',
      jobTitle: 'Network engineer',
      department: 'Product',
      site: 'Sao Paulo',
      siteIcon: '🇧🇷',
      salary: '$1,000',
      startDate: 'Feb 21, 2023',
      lifecycle: 'Hired',
      status: 'Invited',
      statusColor: 'green' as const,
    },
    {
      id: '6',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      name: 'Yulia Polishchuk',
      jobTitle: 'Head of Design',
      department: 'Product',
      site: 'London',
      siteIcon: '🇬🇧',
      salary: '$1,700',
      startDate: 'Aug 2, 2024',
      lifecycle: 'Employed',
      status: 'Absent',
      statusColor: 'gray' as const,
      selected: true,
    },
  ];
  
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
  const handleSelectEmployee = (id: string) => {
    setSelectedEmployee(id === selectedEmployee ? null : id);
  };

  return (
    <div className="pt-24 px-6 pb-10 animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-4xl font-bold mb-2">People</h1>
        
        {/* Progress Bars */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <ProgressBar label="Interviews" value={25} color="black" />
          <ProgressBar label="Hired" value={51} color="yellow" />
          <ProgressBar label="Project time" value={10} color="gray" />
          <ProgressBar label="Output" value={14} color="black" />
        </div>
        
        {/* Controls */}
        <div className="flex justify-end items-center space-x-3 mb-6">
          <button className="px-4 py-2 bg-white rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            Directory
            <svg width="15" height="15" className="ml-1 inline-block" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
            </svg>
          </button>
          
          <button className="px-4 py-2 bg-white rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            Org Chat
            <svg width="15" height="15" className="ml-1 inline-block" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
            </svg>
          </button>
          
          <button className="px-4 py-2 bg-white rounded-full text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            Insights
            <svg width="15" height="15" className="ml-1 inline-block" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
        
        {/* People Table */}
        <PeopleTable 
          employees={sampleEmployees} 
          onSelectEmployee={handleSelectEmployee}
        />
      </div>
    </div>
  );
};

export default People;
