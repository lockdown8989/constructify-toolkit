
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
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    if (externalLanguage) {
      setSelectedLanguage(externalLanguage);
    } else if (contextLanguage) {
      setSelectedLanguage(contextLanguage);
    }
  }, [externalLanguage, contextLanguage]);
  
  const handleLanguageChange = async (value: string) => {
    console.log('🌐 Language change requested:', value);
    setSelectedLanguage(value);
    setIsUpdating(true);
    
    if (onChange) {
      // For form usage - just update the form state
      onChange(value);
      setIsUpdating(false);
    } else {
      // For direct language change - update the context immediately
      try {
        console.log('🌐 Calling setLanguage with:', value);
        await setLanguage(value as any);
        
        // Show success message in the new language
        const selectedOption = languageOptions.find(opt => opt.value === value);
        toast({
          title: "Language Updated",
          description: `Language changed to ${selectedOption?.label}`,
        });
        
        console.log('🌐 Language updated successfully, forcing page reload...');
        // Force a page refresh to ensure all components re-render with new language
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
      } catch (error: any) {
        console.error("❌ Error updating language:", error);
        toast({
          title: "Error updating language",
          description: error.message || "Failed to update language settings",
          variant: "destructive",
        });
        // Revert selection on error
        setSelectedLanguage(contextLanguage);
      } finally {
        setIsUpdating(false);
      }
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
        disabled={isLoading || isUpdating}
      >
        <SelectTrigger className="w-full rounded-xl border-input bg-background h-12">
          <SelectValue placeholder={t('chooseLanguage')} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border shadow-lg bg-popover z-[100] max-h-[300px] overflow-y-auto">
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value} className="cursor-pointer py-3 px-4 focus:bg-accent focus:text-accent-foreground">
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
      {isUpdating && (
        <div className="text-xs text-muted-foreground flex items-center">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
          Updating language...
        </div>
      )}
    </div>
  );
};
