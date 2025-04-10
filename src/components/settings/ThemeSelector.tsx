
import { Label } from "@/components/ui/label";
import { Sun } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export const ThemeSelector = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-base font-medium">
            {t('darkMode')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t('lightModeOnly')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 p-4 rounded-xl bg-gray-50">
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-white shadow-sm">
          <Sun className="h-8 w-8 mb-2 text-amber-500" />
          <span className="text-sm font-medium text-foreground">{t('light')}</span>
        </div>
      </div>
    </div>
  );
};
