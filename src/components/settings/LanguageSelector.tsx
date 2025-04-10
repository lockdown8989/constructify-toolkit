
import { useLanguage } from "@/hooks/use-language";
import { languageOptions } from "@/utils/translations";
import { Label } from "@/components/ui/label";
import { Languages, Check } from "lucide-react";
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
    <div className="space-y-3">
      <Label htmlFor="language" className="text-sm font-medium">{t('preferredLanguage')}</Label>
      <Select 
        value={language} 
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full rounded-xl border border-gray-200 dark:border-slate-700 h-12 px-4 focus:ring-blue-200 dark:focus:ring-blue-900">
          <SelectValue placeholder={t('chooseLanguage')} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 border-none shadow-lg rounded-xl p-1 animate-in fade-in-80 zoom-in-95"> 
          {languageOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              className="rounded-lg focus:bg-gray-100 dark:focus:bg-slate-700 py-2.5 pl-10 pr-3 text-sm cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Languages className="w-4 h-4 mr-2 opacity-70" />
                  <span>{option.label}</span>
                </div>
                {language === option.value && (
                  <Check className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
