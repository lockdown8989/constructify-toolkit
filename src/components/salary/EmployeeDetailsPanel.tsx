import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import type { Employee } from '@/hooks/use-employees';
import { Separator } from '@/components/ui/separator';
import DocumentList from './components/DocumentList';
import EmployeeStatistics from './components/EmployeeStatistics';
import BasicInformation from './components/BasicInformation';
import type { EmployeeDocument } from './types';

interface EmployeeDetailsPanelProps {
  employee: Employee;
  onBack: () => void;
}

const EmployeeDetailsPanel: React.FC<EmployeeDetailsPanelProps> = ({
  employee,
  onBack
}) => {
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const statisticsData = {
    holidayLeft: employee.annual_leave_days || 25,
    sickness: employee.sick_leave_days || 10
  };
  
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching documents for employee:", employee.id);
        
        const { data: storedDocs, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('employee_id', employee.id);
          
        if (docsError) {
          console.error('Error fetching documents:', docsError);
        } else {
          console.log("Documents from documents table:", storedDocs);
        }
        
        const { data: payslips, error: payslipsError } = await supabase
          .from('payroll')
          .select('id, employee_id, payment_date, document_url, document_name')
          .eq('employee_id', employee.id)
          .not('document_url', 'is', null);
          
        if (payslipsError) {
          console.error('Error fetching payslips:', payslipsError);
        } else {
          console.log("Payslips from payroll table:", payslips);
        }
        
        const formattedDocs: EmployeeDocument[] = [];
        
        const hasContract = storedDocs?.some(doc => doc.document_type?.toLowerCase() === 'contract');
        const hasPayslip = storedDocs?.some(doc => doc.document_type?.toLowerCase() === 'payslip');
        
        if (!hasContract) {
          formattedDocs.push({ type: 'contract', name: 'Contract', size: '23 mb' });
        }
        
        if (!hasPayslip) {
          formattedDocs.push({ type: 'payslip', name: 'Payslip', size: '76 kb' });
        }
        
        if (storedDocs && storedDocs.length > 0) {
          for (const doc of storedDocs) {
            if (doc.path) {
              const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(doc.path);
                
              const type = doc.document_type?.toLowerCase().includes('contract') 
                ? 'contract' 
                : 'payslip';
                  
              formattedDocs.push({
                name: doc.name,
                type: type as 'contract' | 'payslip',
                size: doc.size || `Unknown`,
                path: doc.path,
                url: urlData.publicUrl
              });
            }
          }
        }
        
        if (payslips && payslips.length > 0) {
          for (const payslip of payslips) {
            if (payslip.document_name && payslip.document_url) {
              const { data: urlData } = supabase.storage
                .from('documents')
                .getPublicUrl(payslip.document_url);
                
              formattedDocs.push({
                name: payslip.document_name,
                type: 'payslip',
                size: 'Generated PDF',
                path: payslip.document_url,
                url: urlData.publicUrl
              });
            }
          }
        }
        
        console.log("Final formatted documents:", formattedDocs);
        setDocuments(formattedDocs);
      } catch (err) {
        console.error('Error in document fetching:', err);
        setDocuments([
          { type: 'contract', name: 'Contract', size: '23 mb' },
          { type: 'payslip', name: 'Payslip', size: '76 kb' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (employee && employee.id) {
      fetchDocuments();
    }
  }, [employee]);
  
  return (
    <Card className="rounded-3xl overflow-hidden">
      <div className="relative h-44 bg-gradient-to-r from-amber-200 to-amber-500 overflow-hidden">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 left-2 text-white bg-black/20 hover:bg-black/30"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        
        <div className="absolute -bottom-12 w-full flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
            {employee.avatar ? (
              <img 
                src={employee.avatar} 
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 text-xl">
                {employee.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-16 px-6 pb-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">{employee.name}</h2>
          <p className="text-gray-500">{employee.job_title}</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">Basic Information</h3>
            <BasicInformation 
              department={employee.department}
              site={employee.site}
              siteIcon={employee.location === 'Remote' ? '🌐' : '🏢'}
              salary={employee.salary.toString()}
              startDate={employee.start_date}
              lifecycle={employee.lifecycle}
              email={`${employee.name.toLowerCase().replace(' ', '')}@company.com`}
            />
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">Statistics</h3>
            <EmployeeStatistics 
              holidayLeft={statisticsData.holidayLeft}
              sickness={statisticsData.sickness}
            />
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">Documents</h3>
            <DocumentList documents={documents} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeDetailsPanel;
