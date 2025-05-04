
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
import { useState, useEffect } from "react";

interface LanguageSelectorProps {
  language?: string;
  onChange?: (value: string) => void;
}

export const LanguageSelector = ({ language: externalLanguage, onChange }: LanguageSelectorProps) => {
  const { language: contextLanguage, setLanguage, isLoading, t } = useLanguage();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState(externalLanguage || contextLanguage);
  
  useEffect(() => {
    if (externalLanguage) {
      setSelectedLanguage(externalLanguage);
    } else if (contextLanguage) {
      setSelectedLanguage(contextLanguage);
    }
  }, [externalLanguage, contextLanguage]);
  
  const handleLanguageChange = async (value: string) => {
    setSelectedLanguage(value);
    
    if (onChange) {
      onChange(value);
      return;
    }
    
    try {
      await setLanguage(value as any);
    } catch (error: any) {
      console.error("Error updating language:", error);
      toast({
        title: "Error updating language",
        description: error.message || "Failed to update language settings",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Globe className="h-5 w-5 animate-spin text-muted-foreground" />
        <span>{t('loading')}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <Select 
        value={selectedLanguage} 
        onValueChange={handleLanguageChange}
        disabled={isLoading}
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
