
import React from 'react';
import { Card } from '@/components/ui/card';
import { useEmployeeDocuments } from '@/hooks/use-documents';
import DocumentList from '@/components/salary/components/DocumentList';
import { useAuth } from '@/hooks/use-auth';

interface AttendanceReportProps {
  employeeId?: string;
  className?: string;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ 
  employeeId,
  className
}) => {
  const { isManager } = useAuth();
  
  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">
        {isManager ? "Employee Documents" : "My Documents"}
      </h3>
      <DocumentList employeeId={employeeId} />
    </Card>
  );
};

export default AttendanceReport;
