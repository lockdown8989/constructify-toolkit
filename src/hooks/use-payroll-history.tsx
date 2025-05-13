
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PayrollHistoryRecord } from '@/types/supabase/payroll';
import { useState } from 'react';

export const usePayrollHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const fetchPayrollHistory = async (): Promise<PayrollHistoryRecord[]> => {
    const { data: payrollHistory, error } = await supabase
      .from('payroll_history')
      .select(`
        id,
        employee_count,
        success_count,
        fail_count,
        processed_by,
        processing_date,
        employee_ids,
        profiles:processed_by (
          first_name,
          last_name
        )
      `)
      .order('processing_date', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching payroll history: ${error.message}`);
    }
    
    // Process the data to match PayrollHistoryRecord type
    const processedData: PayrollHistoryRecord[] = payrollHistory.map(record => ({
      id: record.id,
      employee_count: record.employee_count,
      success_count: record.success_count,
      fail_count: record.fail_count,
      processed_by: record.processed_by,
      processing_date: record.processing_date,
      employee_ids: record.employee_ids,
      profiles: record.profiles ? {
        first_name: record.profiles.first_name,
        last_name: record.profiles.last_name
      } : undefined
    }));
    
    return processedData;
  };
  
  const { data: payrollHistory, isLoading, error, refetch } = useQuery({
    queryKey: ['payrollHistory'],
    queryFn: fetchPayrollHistory
  });
  
  // Pagination calculations
  const totalPages = payrollHistory ? Math.ceil(payrollHistory.length / pageSize) : 0;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = payrollHistory ? payrollHistory.slice(startIndex, endIndex) : [];
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return {
    payrollHistory: currentPageData,
    isLoading,
    error,
    refetch,
    pagination: {
      currentPage,
      totalPages,
      goToPage,
      goToNextPage,
      goToPreviousPage,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1
    }
  };
};
