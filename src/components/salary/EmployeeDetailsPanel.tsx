
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Employee } from '@/hooks/use-employees';

interface EmployeeDetailsPanelProps {
  employee: Employee;
  onBack: () => void;
}

interface EmployeeDocument {
  name: string;
  type: 'contract' | 'resume' | 'payslip';
  size: string;
  path?: string;
  url?: string;
}

const EmployeeDetailsPanel: React.FC<EmployeeDetailsPanelProps> = ({
  employee,
  onBack
}) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock data for statistics
  const statisticsData = {
    businessTrips: 58,
    sickness: 24
  };
  
  // Fetch employee documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        // Try to fetch documents from the 'documents' bucket
        const { data: storedDocs, error } = await supabase.storage
          .from('documents')
          .list(`employees/${employee.id}`);
          
        if (error) {
          console.error('Error fetching documents:', error);
          // Default documents if nothing found
          setDocuments([
            { type: 'contract', name: 'Contract', size: '23 mb' },
            { type: 'resume', name: 'Resume', size: '76 kb' }
          ]);
          return;
        }
        
        // Also fetch payslips
        const { data: payslips, error: payslipsError } = await supabase
          .from('payroll')
          .select('document_name, document_url')
          .eq('employee_id', employee.id)
          .not('document_url', 'is', null);
          
        if (payslipsError) {
          console.error('Error fetching payslips:', payslipsError);
        }
        
        const formattedDocs: EmployeeDocument[] = [];
        
        // Add default document types if they're not in the stored docs
        if (!storedDocs?.some(doc => doc.name.toLowerCase().includes('contract'))) {
          formattedDocs.push({ type: 'contract', name: 'Contract', size: '23 mb' });
        }
        
        if (!storedDocs?.some(doc => doc.name.toLowerCase().includes('resume'))) {
          formattedDocs.push({ type: 'resume', name: 'Resume', size: '76 kb' });
        }
        
        // Add stored docs
        if (storedDocs && storedDocs.length > 0) {
          for (const doc of storedDocs) {
            // Get file URL
            const { data: urlData } = supabase.storage
              .from('documents')
              .getPublicUrl(`employees/${employee.id}/${doc.name}`);
              
            const type = doc.name.toLowerCase().includes('contract') 
              ? 'contract' 
              : doc.name.toLowerCase().includes('resume')
                ? 'resume'
                : 'payslip';
                
            formattedDocs.push({
              name: doc.name,
              type,
              size: `${Math.round(doc.metadata.size / 1024)} kb`,
              path: doc.name,
              url: urlData.publicUrl
            });
          }
        }
        
        // Add payslips
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
        
        setDocuments(formattedDocs);
      } catch (err) {
        console.error('Error in document fetching:', err);
        // Default documents if error
        setDocuments([
          { type: 'contract', name: 'Contract', size: '23 mb' },
          { type: 'resume', name: 'Resume', size: '76 kb' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (employee && employee.id) {
      fetchDocuments();
    }
  }, [employee]);
  
  const handleDocumentClick = async (doc: EmployeeDocument) => {
    if (doc.url) {
      window.open(doc.url, '_blank');
    } else {
      toast({
        title: "Document not available",
        description: "This document has not been uploaded yet.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="rounded-3xl overflow-hidden">
      {/* Header with background image */}
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
        
        {/* Employee avatar and info */}
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
      
      {/* Employee details */}
      <div className="pt-16 px-6 pb-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">{employee.name}</h2>
          <p className="text-gray-500">{employee.job_title}</p>
        </div>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Basic Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">🎂</div>
                <div className="text-sm font-medium w-28">Birthday</div>
                <div className="text-sm text-gray-600">26 September 1998</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">📱</div>
                <div className="text-sm font-medium w-28">Phone number</div>
                <div className="text-sm text-gray-600">+33 170 36 39 50</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">✉️</div>
                <div className="text-sm font-medium w-28">E-Mail</div>
                <div className="text-sm text-gray-600 truncate">{employee.name.toLowerCase().replace(' ', '')}@company.com</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">🌍</div>
                <div className="text-sm font-medium w-28">Citizenship</div>
                <div className="text-sm text-gray-600">{employee.location || "United States"}</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">🏙️</div>
                <div className="text-sm font-medium w-28">City</div>
                <div className="text-sm text-gray-600">{employee.location || "New York"}</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 mr-3 flex-shrink-0 text-gray-400">📍</div>
                <div className="text-sm font-medium w-28">Address</div>
                <div className="text-sm text-gray-600">123 Company Street</div>
              </div>
            </div>
          </div>
          
          {/* Documents */}
          <div>
            <h3 className="text-lg font-medium mb-3">Documents</h3>
            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                <div className="col-span-2 py-4 text-center">
                  <div className="animate-pulse">Loading documents...</div>
                </div>
              ) : (
                documents.map((doc, index) => (
                  <div 
                    key={index} 
                    className="flex items-center p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mr-3",
                      doc.type === 'contract' ? "bg-blue-100 text-blue-700" : 
                      doc.type === 'resume' ? "bg-red-100 text-red-700" :
                      "bg-green-100 text-green-700"
                    )}>
                      {doc.type === 'contract' ? 'C' : doc.type === 'resume' ? 'R' : 'P'}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{doc.name.split('_')[0]}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        {doc.size}
                        {doc.url && (
                          <Download className="h-3 w-3 ml-1 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Statistics */}
          <div>
            <h3 className="text-lg font-medium mb-3">Statistics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Business trips</span>
                  <span className="text-sm font-medium">{statisticsData.businessTrips} days</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${(statisticsData.businessTrips / 100) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Sickness</span>
                  <span className="text-sm font-medium">{statisticsData.sickness} days</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-gray-800 rounded-full" 
                    style={{ width: `${(statisticsData.sickness / 100) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeDetailsPanel;
