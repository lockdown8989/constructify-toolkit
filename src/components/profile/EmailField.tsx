
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@supabase/supabase-js";
import { Mail } from "lucide-react";

interface EmailFieldProps {
  user: User | null;
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditable?: boolean;
}

export const EmailField = ({ user, email, onChange, isEditable = false }: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium">
        Email Address
      </Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          id="email"
          name="email"
          value={email}
          onChange={onChange}
          disabled={!isEditable}
          className={`pl-10 ${!isEditable ? 'bg-gray-50' : ''}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {isEditable 
          ? "You can update your email address" 
          : "This email is associated with your account and cannot be changed"}
      </p>
    </div>
  );
};
