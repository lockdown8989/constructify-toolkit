
import React from 'react';
import { Info, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  status: string;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  status,
  onInfoClick,
  onEmailClick,
  onCancelClick
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onInfoClick}
      >
        <Info className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onEmailClick}
      >
        <Mail className="h-4 w-4" />
      </Button>
      {status === 'pending' && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onCancelClick}
          className="h-8"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      )}
    </div>
  );
};
