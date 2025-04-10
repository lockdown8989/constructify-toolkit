
import { useLanguage, languageOptions } from "@/hooks/use-language";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Languages } from "lucide-react";

interface LanguageSelectorProps {
  language: string;
  onChange: (value: string) => void;
}

export const LanguageSelector = ({ language, onChange }: LanguageSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="language">Preferred Language</Label>
      <Select 
        value={language} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center">
                <Languages className="w-4 h-4 mr-2" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
