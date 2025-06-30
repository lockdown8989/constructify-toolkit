
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ManagerIdFieldProps {
  managerId: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isManager: boolean;
  isEditable: boolean;
}

const ManagerIdField: React.FC<ManagerIdFieldProps> = ({
  managerId,
  onChange,
  isManager,
  isEditable
}) => {
  const { toast } = useToast();

  const handleCopyManagerId = () => {
    if (managerId) {
      navigator.clipboard.writeText(managerId);
      toast({
        title: "Manager ID Copied",
        description: "Your Manager ID has been copied to clipboard. Share this with your employees."
      });
    }
  };

  const generateManagerId = () => {
    const newId = `MGR-${Math.floor(Math.random() * 90000) + 10000}`;
    const event = {
      target: { name: 'manager_id', value: newId }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    
    toast({
      title: "Manager ID Generated",
      description: "New Manager ID created. Don't forget to save your changes."
    });
  };

  if (isManager) {
    return (
      <div className="space-y-2">
        <Label htmlFor="manager_id">Your Manager ID</Label>
        <div className="flex gap-2">
          <Input
            id="manager_id"
            name="manager_id"
            value={managerId || ''}
            onChange={onChange}
            placeholder="Generate or enter your Manager ID"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={generateManagerId}
            title="Generate Manager ID"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {managerId && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyManagerId}
              title="Copy Manager ID"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Share your Manager ID with employees so they can connect to your account
        </p>
      </div>
    );
  }

  if (!isEditable) {
    return (
      <div className="space-y-2">
        <Label htmlFor="manager_id">Manager ID</Label>
        <Input
          id="manager_id"
          name="manager_id"
          value={managerId || 'Not assigned'}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-muted-foreground">
          Contact your administrator to update your manager assignment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="manager_id">Manager ID (Optional)</Label>
      <Input
        id="manager_id"
        name="manager_id"
        value={managerId || ''}
        onChange={onChange}
        placeholder="Enter your manager's ID"
      />
      <p className="text-xs text-muted-foreground">
        Enter your manager's ID to connect to their account
      </p>
    </div>
  );
};

export default ManagerIdField;
