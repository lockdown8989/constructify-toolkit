
import { useLanguage, languageOptions } from "@/hooks/use-language";
import { Label } from "@/components/ui/label";
import { Languages } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface LanguageSelectorProps {
  language: string;
  onChange: (value: string) => void;
}

export const LanguageSelector = ({ language, onChange }: LanguageSelectorProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="language">{t('preferredLanguage')}</Label>
      <Select 
        value={language} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('chooseLanguage')} />
        </SelectTrigger>
        <SelectContent className="bg-popover"> 
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
