
import { useState, useMemo } from 'react';
import { Employee } from '@/hooks/use-employees';

export const useEmployeeData = (
  employees: Employee[] = [],
  searchQuery: string,
  sortField: keyof Employee,
  sortDirection: 'asc' | 'desc'
) => {
  // Process employees based on search and sorting
  const processedEmployees = useMemo(() => {
    // First apply search filter
    let filtered = employees.filter(employee => {
      const query = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.job_title.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query) ||
        employee.site.toLowerCase().includes(query) ||
        employee.lifecycle.toLowerCase().includes(query) ||
        employee.status.toLowerCase().includes(query) ||
        employee.salary.toString().includes(query) ||
        new Date(employee.start_date).toLocaleDateString().includes(query)
      );
    });
    
    // Then sort
    filtered.sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc' 
          ? fieldA - fieldB
          : fieldB - fieldA;
      }
      
      // Handle dates
      if (sortField === 'start_date') {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
      
      return 0;
    });
    
    return filtered.map(employee => ({
      id: employee.id,
      avatar: employee.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'women' : 'men'}/${Math.floor(Math.random() * 99)}.jpg`,
      name: employee.name,
      jobTitle: employee.job_title,
      department: employee.department,
      site: employee.site,
      siteIcon: employee.site.includes('Remote') ? '🌐' : '🏢',
      salary: `$${employee.salary.toLocaleString()}`,
      startDate: new Date(employee.start_date).toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      lifecycle: employee.lifecycle,
      status: employee.status,
      statusColor: employee.status === 'Active'
        ? 'green' as const
        : employee.status === 'Inactive'
        ? 'gray' as const
        : employee.status === 'Invited'
        ? 'blue' as const
        : employee.status === 'Absent'
        ? 'amber' as const
        : employee.status === 'On Leave'
        ? 'yellow' as const
        : 'gray' as const,
    }));
  }, [employees, searchQuery, sortField, sortDirection]);

  return processedEmployees;
};
