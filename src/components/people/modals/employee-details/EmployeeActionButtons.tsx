
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface EmployeeActionButtonsProps {
  isEditing: boolean;
  isSubmitting: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  externalIsEditing: boolean;
}

const EmployeeActionButtons: React.FC<EmployeeActionButtonsProps> = ({
  isEditing,
  isSubmitting,
  onEdit,
  onSave,
  onCancel,
  externalIsEditing
}) => {
  const { isPayroll, isAdmin, isHR, isManager } = useAuth();
  
  // Determine if user can edit - payroll users should be able to edit
  const canEdit = isPayroll || isAdmin || isHR || isManager;
  
  if (externalIsEditing || !canEdit) {
    return null;
  }

  return (
    <div className="flex justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      ) : (
        <Button onClick={onEdit}>
          <Edit3 className="h-4 w-4 mr-2" />
          Edit Employee
        </Button>
      )}
    </div>
  );
};

export default EmployeeActionButtons;
