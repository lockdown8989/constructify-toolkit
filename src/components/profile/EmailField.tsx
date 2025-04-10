
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@supabase/supabase-js";

interface EmailFieldProps {
  user: User | null;
}

export const EmailField = ({ user }: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        value={user?.email || ""}
        disabled
        className="bg-gray-100"
      />
      <p className="text-xs text-gray-500">Email cannot be changed</p>
    </div>
  );
};
