
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@supabase/supabase-js";
import { Mail } from "lucide-react";

interface EmailFieldProps {
  user: User | null;
}

export const EmailField = ({ user }: EmailFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-medium">
        Email Address
      </Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          id="email"
          value={user?.email || ""}
          disabled
          className="bg-gray-50 pl-10"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        This email is associated with your account and cannot be changed
      </p>
    </div>
  );
};
