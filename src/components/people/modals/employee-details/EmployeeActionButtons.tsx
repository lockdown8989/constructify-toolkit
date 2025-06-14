
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit3, Save, X } from 'lucide-react';

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
  if (externalIsEditing) {
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
