
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit } from 'lucide-react';

interface DraftShiftIndicatorProps {
  isDraft?: boolean;
  canBeEdited?: boolean;
  className?: string;
}

const DraftShiftIndicator: React.FC<DraftShiftIndicatorProps> = ({
  isDraft = false,
  canBeEdited = false,
  className = ""
}) => {
  if (!isDraft && !canBeEdited) return null;

  return (
    <div className={`flex gap-1 ${className}`}>
      {isDraft && (
        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
          <FileText className="h-3 w-3 mr-1" />
          Draft
        </Badge>
      )}
      {canBeEdited && !isDraft && (
        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
          <Edit className="h-3 w-3 mr-1" />
          Editable
        </Badge>
      )}
    </div>
  );
};

export default DraftShiftIndicator;
