
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInfoFieldsProps {
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BasicInfoFields = ({ 
  firstName, 
  lastName, 
  position, 
  department, 
  onChange 
}: BasicInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            name="first_name"
            value={firstName}
            onChange={onChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            name="last_name"
            value={lastName}
            onChange={onChange}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          name="position"
          value={position}
          onChange={onChange}
          placeholder="e.g. Software Developer"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          name="department"
          value={department}
          onChange={onChange}
          placeholder="e.g. Engineering"
        />
      </div>
    </>
  );
};
