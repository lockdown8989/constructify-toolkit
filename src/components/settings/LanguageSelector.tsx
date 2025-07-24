
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
import { useState } from "react";

interface LanguageSelectorProps {
  language?: string;
  onChange?: (value: string) => void;
}

export const LanguageSelector = ({ language: externalLanguage, onChange }: LanguageSelectorProps) => {
  const { language: contextLanguage, setLanguage, isLoading, t } = useLanguage();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Use external language if provided, otherwise use context language
  const currentLanguage = externalLanguage || contextLanguage;
  
  const handleLanguageChange = async (value: string) => {
    console.log('LanguageSelector: Language change requested:', value);
    setIsSaving(true);
    
    try {
      if (onChange) {
        // For form usage - just update the form state
        onChange(value);
        console.log('LanguageSelector: Updated form state');
      } else {
        // For direct language change - update the context immediately
        console.log('LanguageSelector: Updating language context');
        await setLanguage(value as any);
        
        toast({
          title: "Language Updated",
          description: `Language changed to ${languageOptions.find(opt => opt.value === value)?.label}`,
        });
        
        // Force page refresh to ensure all components re-render with new language
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      console.error("LanguageSelector: Error updating language:", error);
      toast({
        title: "Error updating language",
        description: error.message || "Failed to update language settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-3 border rounded-xl">
        <Globe className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm">{t('loading')}</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <Select 
        value={currentLanguage} 
        onValueChange={handleLanguageChange}
        disabled={isLoading || isSaving}
      >
        <SelectTrigger className="w-full rounded-xl border-input bg-background h-12">
          <SelectValue placeholder={t('chooseLanguage')} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border shadow-lg bg-popover z-50 max-h-80">
          {languageOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value} 
              className="cursor-pointer py-3 px-3 hover:bg-accent"
            >
              <div className="flex items-center w-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 mr-3">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {isSaving && (
        <div className="text-xs text-muted-foreground flex items-center">
          <Globe className="w-3 h-3 animate-spin mr-1" />
          Updating language...
        </div>
      )}
    </div>
  );
};
