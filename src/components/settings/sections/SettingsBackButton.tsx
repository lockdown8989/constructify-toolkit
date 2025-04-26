
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SettingsBackButtonProps {
  onClick: () => void;
}

export const SettingsBackButton = ({ onClick }: SettingsBackButtonProps) => (
  <Button 
    variant="ghost" 
    className="mb-4 flex items-center text-muted-foreground font-normal"
    onClick={onClick}
  >
    <ArrowLeft className="h-4 w-4 mr-2" />
    Back to Settings
  </Button>
);
