
import { useLanguage, languageOptions } from "@/hooks/use-language";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LanguageSelectorProps {
  language: string;
  onChange: (value: string) => void;
}

export const LanguageSelector = ({ language, onChange }: LanguageSelectorProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const handleLanguageChange = (value: string) => {
    onChange(value);
    
    // Get language label for toast
    const selectedLanguage = languageOptions.find(option => option.value === value);
    
    toast({
      title: "Language updated",
      description: `Language has been changed to ${selectedLanguage?.label || value}`,
    });
  };
  
  return (
    <div className="space-y-2">
      <Select 
        value={language} 
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-full rounded-xl border-input bg-background h-12">
          <SelectValue placeholder={t('chooseLanguage')} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border shadow-lg">
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer py-2.5">
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mr-2">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
